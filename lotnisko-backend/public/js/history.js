document.addEventListener('DOMContentLoaded', () => {
    // tylko klient
    checkSession(['CLIENT']);
    loadHistory();
});

/* ============================
   ŁADOWANIE HISTORII ZAKUPÓW
============================ */
async function loadHistory() {
    const body = document.getElementById('tickets-container');

    if (!body) {
        console.error('❌ Brak elementu #tickets-container w HTML');
        return;
    }

    body.innerHTML = `
        <tr>
            <td colspan="5" class="table-loading">
                ⏳ Ładowanie historii zakupów...
            </td>
        </tr>
    `;

    try {
        /* 🔥 KLUCZOWE: apiFetch – te same nagłówki co w management */
        const tickets = await apiFetch('/moje-bilety');

        console.log('🎟️ tickets raw:', tickets);

        body.innerHTML = '';

        if (!Array.isArray(tickets) || tickets.length === 0) {
            body.innerHTML = `
                <tr>
                    <td colspan="5" class="table-loading">
                        Brak historii zakupów
                    </td>
                </tr>
            `;
            return;
        }

        tickets.forEach((b, index) => {
            console.log(`➡️ ticket[${index}]`, b);

            const tr = document.createElement('tr');

            const status = b.status ?? '—';
            const statusClass = `status-${status}`;

            /* ============================
               🔒 RELACJE (MOGĄ NIE ISTNIEĆ)
            ============================ */
            const rezerwacja = b.rezerwacja ?? null;
            const miejsce = rezerwacja?.miejsce ?? null;
            const lot = miejsce?.lot ?? null;
            const trasa = lot?.trasa ?? null;

            /* ============================
               ✅ TRASA
            ============================ */
            const miastoWylot =
                trasa?.lotnisko_wylotu?.miasto ?? '—';

            const miastoPrzylot =
                trasa?.lotnisko_przylotu?.miasto ?? '—';

            /* ============================
               ✅ DATA LOTU (CZYTELNA)
               ❌ FALLBACK: data_wystawienia
            ============================ */
            let dataLotu = '—';

            if (lot?.data) {
                dataLotu = formatDateTime(lot.data, lot.godzina);
            } else if (b.data_wystawienia) {
                dataLotu = formatDateTime(b.data_wystawienia);
            }

            tr.innerHTML = `
                <td>${b.numer_biletu ?? '—'}</td>

                <td>
                    ${miastoWylot}
                    →
                    ${miastoPrzylot}
                </td>

                <td>
                    ${dataLotu}
                </td>

                <td>
                    <span class="status-badge ${statusClass}">
                        ${status}
                    </span>
                </td>

                <td>
                    ${
                        status === 'OPLACONY'
                            ? `
                                <button
                                    class="action-btn"
                                    onclick="downloadInvoice(${b.id})"
                                >
                                    🧾 Faktura
                                </button>
                              `
                            : `<span style="color:#999">—</span>`
                    }
                </td>
            `;

            body.appendChild(tr);
        });

    } catch (err) {
        console.error('❌ loadHistory error:', err);

        body.innerHTML = `
            <tr>
                <td colspan="5" class="table-loading" style="color:red">
                    ❌ Błąd pobierania historii zakupów
                </td>
            </tr>
        `;
    }
}

/* ============================
   FORMATOWANIE DATY I GODZINY
============================ */
function formatDateTime(dateString, timeString = '') {
    if (!dateString) return '—';

    const d = new Date(dateString);

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    const time = timeString ? timeString.slice(0, 5) : '';

    return `${day}.${month}.${year} ${time}`.trim();
}

/* ============================
   FAKTURA (TA SAMA LOGIKA CO KASJER)
============================ */
async function downloadInvoice(biletId) {
    try {
        const response = await fetch(`/cashier/faktura/${biletId}`);

        if (!response.ok) {
            throw new Error('Błąd pobierania faktury');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `faktura_${biletId}.pdf`;
        document.body.appendChild(a);
        a.click();

        a.remove();
        window.URL.revokeObjectURL(url);

    } catch (e) {
        console.error(e);
        alert('❌ Nie udało się pobrać faktury');
    }
}

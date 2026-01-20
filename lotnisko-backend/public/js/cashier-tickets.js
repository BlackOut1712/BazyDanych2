document.addEventListener('DOMContentLoaded', () => {
    // tylko kasjer
    checkSession(['KASJER']);
    loadTickets();
});

/* ============================
   ŁADOWANIE BILETÓW
============================ */
async function loadTickets() {
    const body = document.getElementById('ticketsBody');

    if (!body) {
        console.error('Brak elementu #ticketsBody w HTML');
        return;
    }

    body.innerHTML = `
        <tr>
            <td colspan="6" class="table-loading">
                ⏳ Ładowanie biletów...
            </td>
        </tr>
    `;

    try {
        // ✅ BILETY – nie rezerwacje
        const tickets = await apiFetch('/bilety');
        body.innerHTML = '';

        if (!tickets || tickets.length === 0) {
            body.innerHTML = `
                <tr>
                    <td colspan="6" class="table-loading">
                        Brak biletów do obsługi
                    </td>
                </tr>
            `;
            return;
        }

        tickets.forEach(b => {
            const tr = document.createElement('tr');

            const statusClass = `status-${b.status}`;
            const isInactive = ['ZWROCONY', 'ANULOWANY'].includes(b.status);

            // ✅ POPRAWNE ŚCIEŻKI Z JSON-a
            const miejsce = b.rezerwacja?.miejsce;
            const lot = miejsce?.lot;
            const trasa = lot?.trasa;

            const miastoWylot =
                trasa?.lotnisko_wylotu?.miasto ?? '—';

            const miastoPrzylot =
                trasa?.lotnisko_przylotu?.miasto ?? '—';

            const numerMiejsca =
                miejsce?.numer_miejsca ?? '—';

            tr.innerHTML = `
                <td>${b.numer_biletu}</td>

                <td>
                    ${b.imie_pasazera} ${b.nazwisko_pasazera}
                </td>

                <td>
                    ${miastoWylot}
                    →
                    ${miastoPrzylot}
                </td>

                <td>
                    ${numerMiejsca}
                </td>

                <td>
                    <span class="status-badge ${statusClass}">
                        ${b.status}
                    </span>
                </td>

                <td>
                    ${
                        isInactive
                            ? `<span style="color:#999">—</span>`
                            : `
                                <div class="ticket-actions">
                                    <button
                                        class="action-btn"
                                        onclick="changeSeat(${b.id})"
                                    >
                                        🔄 Miejsce
                                    </button>

                                    <button
                                        class="action-btn"
                                        onclick="refundTicket(${b.id})"
                                    >
                                        💸 Zwrot
                                    </button>

                                    <button
                                        class="action-btn"
                                        onclick="issueInvoice(${b.id})"
                                    >
                                        🧾 Faktura
                                    </button>
                                </div>
                              `
                    }
                </td>
            `;

            body.appendChild(tr);
        });

    } catch (err) {
        console.error('loadTickets error:', err);
        body.innerHTML = `
            <tr>
                <td colspan="6" class="table-loading" style="color:red">
                    ❌ Błąd pobierania biletów
                </td>
            </tr>
        `;
    }
}

/* ============================
   AKCJE (zgodne z UML)
============================ */

/**
 * <<extend>> Zmiana zarezerwowanego miejsca
 */
function changeSeat(biletId) {
    localStorage.setItem('changeSeatBiletId', biletId);
    window.location.href = `/cashier/change-seat`;
}

/**
 * <<extend>> Zwrot biletu
 *   <<include>> Zwrot środków
 *   <<include>> Anulowanie rezerwacji
 */
function refundTicket(biletId) {
    if (!confirm('Czy na pewno chcesz zwrócić ten bilet?')) return;

    localStorage.setItem('refund_bilet_id', biletId);

    window.location.href = '/cashier/refund';
}

/**
 * <<extend>> Wystawienie faktury
 * ✔ TEN SAM KOD
 * ✔ TEN SAM FETCH
 * ✔ JEDYNA ZMIANA: URL → WEB ROUTE
 */
async function issueInvoice(biletId) {
    try {
        const response = await fetch(`/cashier/faktura/${biletId}`, {
            method: 'GET'
        });

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
        alert('❌ Nie udało się wygenerować faktury');
    }
}

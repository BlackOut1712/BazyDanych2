document.addEventListener('DOMContentLoaded', () => {
    checkSession(['KASJER', 'MENADZER']);
    loadReservations();
});

/* ======================================================
   POBIERANIE REZERWACJI Z API
====================================================== */
async function loadReservations() {
    const body = document.getElementById('reservationsBody');
    body.innerHTML = `
        <tr>
            <td colspan="5" class="table-loading">
                ⏳ Ładowanie rezerwacji...
            </td>
        </tr>
    `;

    try {
        const reservations = await apiFetch('/pracownik/rezerwacje');
        body.innerHTML = '';

        if (!reservations || reservations.length === 0) {
            body.innerHTML = `
                <tr>
                    <td colspan="5" class="table-loading">
                        Brak rezerwacji do obsługi
                    </td>
                </tr>
            `;
            return;
        }

        reservations.forEach(r => {
            const tr = document.createElement('tr');

            const statusClass = `status-${r.status}`;
            const disabled = r.status === 'WYGASLA';

            tr.innerHTML = `
                <td>
                    ${r.klient.imie} ${r.klient.nazwisko}
                </td>

                <td>
                    ${r.lot.trasa.lotniskoWylotu.miasto}
                    →
                    ${r.lot.trasa.lotniskoPrzylotu.miasto}
                </td>

                <td>
                    ${r.miejsce.numer}
                </td>

                <td>
                    <span class="status-badge ${statusClass}">
                        ${r.status}
                    </span>
                </td>

                <td>
                    ${
                        disabled
                            ? `<span style="color:#999">—</span>`
                            : `
                                <button
                                    class="action-btn"
                                    onclick="handleReservation(${r.id})"
                                >
                                    💳 Sprzedaj
                                </button>
                              `
                    }
                </td>
            `;

            body.appendChild(tr);
        });

    } catch (err) {
        console.error(err);
        body.innerHTML = `
            <tr>
                <td colspan="5" class="table-loading" style="color:red">
                    ❌ Błąd pobierania rezerwacji
                </td>
            </tr>
        `;
    }
}

/* ======================================================
   OBSŁUGA REZERWACJI → SPRZEDAŻ
====================================================== */
function handleReservation(reservationId) {
    if (!reservationId) {
        alert('Brak ID rezerwacji');
        return;
    }

    // zapis ID rezerwacji dla sell.html
    localStorage.setItem('cashierReservationId', reservationId);

    // przejście do sprzedaży
    window.location.href = 'sell.html';
}

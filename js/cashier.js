document.addEventListener('DOMContentLoaded', async () => {

    // 🔐 Dostęp: KASJER + MENADZER
    checkSession(['KASJER', 'MENADZER']);

    const body = document.getElementById('reservationsBody');
    if (!body) return;

    body.innerHTML = `
        <tr>
            <td colspan="6">Ładowanie rezerwacji...</td>
        </tr>
    `;

    try {
        const rezerwacje = await apiFetch('/pracownik/rezerwacje');

        body.innerHTML = '';

        if (!rezerwacje || rezerwacje.length === 0) {
            body.innerHTML = `
                <tr>
                    <td colspan="6">Brak rezerwacji do obsługi</td>
                </tr>
            `;
            return;
        }

        rezerwacje.forEach(r => {
            const tr = document.createElement('tr');

            tr.innerHTML = `
                <td>${r.klient?.imie ?? ''} ${r.klient?.nazwisko ?? ''}</td>
                <td>
                    ${r.lot?.trasa?.lotnisko_wylotu?.miasto ?? '—'}
                    →
                    ${r.lot?.trasa?.lotnisko_przylotu?.miasto ?? '—'}
                </td>
                <td>${r.lot?.data ?? ''} ${r.lot?.godzina ?? ''}</td>
                <td>${r.miejsce?.numer ?? '—'}</td>
                <td>${r.status ?? '—'}</td>
                <td>
                    <button class="btn-primary"
                        onclick="sellTicket(${r.id})">
                        Obsłuż
                    </button>
                </td>
            `;

            body.appendChild(tr);
        });

    } catch (e) {
        console.error('Błąd rezerwacji:', e);
        body.innerHTML = `
            <tr>
                <td colspan="6">Błąd pobierania rezerwacji</td>
            </tr>
        `;
    }
});

/**
 * 👉 Przejście do sprzedaży biletu
 */
function sellTicket(reservationId) {
    localStorage.setItem('cashierReservationId', reservationId);
    window.location.href = 'sell.html';
}

function goToSell() {
    window.location.href = 'sell.html';
}

function goToReservations() {
    window.location.href = 'reservations.html';
}

function goToRefund() {
    window.location.href = 'refund.html';
}

document.addEventListener('DOMContentLoaded', async () => {
    checkSession(['cashier', 'admin']);

    const reservationId = localStorage.getItem('cashierReservationId');
    if (!reservationId) {
        alert('Brak rezerwacji');
        goBack();
        return;
    }

    try {
        const r = await apiFetch(`/rezerwacje/${reservationId}`);

        document.getElementById('sellInfo').innerHTML = `
            <p><strong>Klient:</strong> ${r.klient.imie} ${r.klient.nazwisko}</p>
            <p><strong>Miejsce:</strong> ${r.miejsce.numer}</p>
            <p><strong>Status:</strong> ${r.status}</p>
        `;

        document.getElementById('sellBtn').onclick = async () => {
            await sell(r);
        };

    } catch (e) {
        alert('Błąd danych rezerwacji');
    }
});

async function sell(r) {
    try {
        // 1️⃣ wystaw bilet
        const bilet = await apiFetch('/bilety', {
            method: 'POST',
            body: JSON.stringify({
                imie_pasazera: r.klient.imie,
                nazwisko_pasazera: r.klient.nazwisko,
                pesel_pasazera: r.klient.pesel,
                rezerwacja_id: r.id,
                lot_id: r.lot_id,
                miejsce_id: r.miejsce_id
            })
        });

        // 2️⃣ płatność (gotówka)
        await apiFetch('/platnosci', {
            method: 'POST',
            body: JSON.stringify({
                kwota: 350,
                metoda: 'GOTOWKA',
                klient_id: r.klient_id,
                bilet_id: bilet.id
            })
        });

        alert('Bilet sprzedany');
        window.location.href = 'dashboard.html';

    } catch (e) {
        console.error(e);
        alert('Błąd sprzedaży');
    }
}

function goBack() {
    window.location.href = 'dashboard.html';
}

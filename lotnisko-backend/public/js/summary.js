document.addEventListener('DOMContentLoaded', async () => {
    checkSession(['client']);

    const user = JSON.parse(localStorage.getItem('user'));
    const flight = JSON.parse(localStorage.getItem('selectedFlight'));

    if (!user || !flight) {
        alert('Brak danych rezerwacji');
        window.location.href = 'search.html';
        return;
    }

    try {
        
        const rezerwacje = await apiFetch(`/rezerwacje?klient_id=${user.id}&lot_id=${flight.id}`);

        if (!rezerwacje.length) {
            alert('Nie znaleziono rezerwacji');
            window.location.href = 'search.html';
            return;
        }

        const r = rezerwacje[0]; // najnowsza

        renderSummary(r, flight);

        document.getElementById('payBtn').onclick = () => {
            localStorage.setItem('currentReservation', JSON.stringify(r));
            window.location.href = 'payment.html';
        };

    } catch (e) {
        console.error(e);
        alert('Błąd pobierania rezerwacji');
    }
});

function renderSummary(r, flight) {
    document.getElementById('summaryData').innerHTML = `
        <p><strong>Trasa:</strong>
            ${flight.trasa.lotnisko_wylotu.miasto}
            →
            ${flight.trasa.lotnisko_przylotu.miasto}
        </p>

        <p><strong>Data:</strong> ${flight.data}</p>
        <p><strong>Godzina:</strong> ${flight.godzina}</p>
        <p><strong>Miejsce:</strong> ${r.miejsce_id}</p>
        <p><strong>Status:</strong> ${r.status}</p>
    `;
}

function goBack() {
    window.location.href = 'search.html';
}

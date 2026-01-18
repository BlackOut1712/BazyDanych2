// ochrona strony – tylko klient
document.addEventListener('DOMContentLoaded', () => {
    checkSession(['client']);
});

function goToSeats(flight) {
    const role = localStorage.getItem('role');

    
    if (!role) {
        alert('Aby kupić bilet musisz się zalogować');
        window.location.href = 'login.html';
        return;
    }

    
    if (role !== 'client') {
        alert('Tylko klient może kupić bilet');
        return;
    }

    localStorage.setItem('selectedFlight', JSON.stringify(flight));
    window.location.href = 'seats.html';
}


async function searchFlights() {
    const resultsBody = document.getElementById('resultsBody');
    resultsBody.innerHTML = '';

    const date = document.getElementById('date')?.value || '';
    const from = document.getElementById('from')?.value.toLowerCase() || '';
    const to = document.getElementById('to')?.value.toLowerCase() || '';

    try {
        const flights = await apiFetch('/loty');

        const filtered = flights.filter(flight => {
            const matchDate = date ? flight.data === date : true;

            const matchFrom = from
                ? flight.trasa?.lotnisko_wylotu?.miasto
                      ?.toLowerCase()
                      .includes(from)
                : true;

            const matchTo = to
                ? flight.trasa?.lotnisko_przylotu?.miasto
                      ?.toLowerCase()
                      .includes(to)
                : true;

            return matchDate && matchFrom && matchTo;
        });

        if (!filtered.length) {
            resultsBody.innerHTML = `
                <tr><td colspan="6">Brak wyników</td></tr>
            `;
            return;
        }

        filtered.forEach(flight => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${flight.trasa.lotnisko_wylotu.miasto}</td>
                <td>${flight.trasa.lotnisko_przylotu.miasto}</td>
                <td>${flight.data}</td>
                <td>${flight.godzina}</td>
                <td>---</td>
                <td>
                    <button class="buy-btn"
                        onclick='goToSeats(${JSON.stringify(flight)})'>
                        Kup bilet
                    </button>
                </td>
            `;

            resultsBody.appendChild(row);
        });

    } catch (err) {
        console.error(err);
        resultsBody.innerHTML = `
            <tr><td colspan="6">Błąd pobierania lotów</td></tr>
        `;
    }
}

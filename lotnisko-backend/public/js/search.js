
alert('NOWA WERSJA SEARCH FLIGHTS');

document.addEventListener('DOMContentLoaded', () => {
    checkSession(['client']);
    searchFlights();
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
    if (!resultsBody) return;

    resultsBody.innerHTML =
        `<tr><td colspan="6">Ładowanie...</td></tr>`;

    const dateInput = document.getElementById('date')?.value || '';
    const fromInput = document.getElementById('from')?.value.toLowerCase() || '';
    const toInput = document.getElementById('to')?.value.toLowerCase() || '';

    const now = new Date();

    try {
        const flights = await apiFetch('/loty');

        const filtered = flights.filter(flight => {

            if (flight.status !== 'AKTYWNY') return false;

            if (!flight.data || !flight.godzina) return false;


            const flightDateTime = new Date(`${flight.data}T${flight.godzina}`);


            if (flightDateTime < now) return false;

            /* =========================
               🔍 FILTRY
            ========================= */
            const cityFrom =
                flight.trasa?.lotnisko_wylotu?.miasto?.toLowerCase() || '';
            const cityTo =
                flight.trasa?.lotnisko_przylotu?.miasto?.toLowerCase() || '';

            if (fromInput && !cityFrom.includes(fromInput)) return false;
            if (toInput && !cityTo.includes(toInput)) return false;
            if (dateInput && flight.data !== dateInput) return false;

            return true;
        });

        resultsBody.innerHTML = '';

        if (!filtered.length) {
            resultsBody.innerHTML =
                `<tr><td colspan="6">Brak wyników</td></tr>`;
            return;
        }

        filtered.forEach(flight => {
            const row = document.createElement('tr');

            const dateText = new Date(flight.data).toLocaleDateString('pl-PL', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });

            const timeText = flight.godzina.slice(0, 5);

            row.innerHTML = `
                <td>${flight.trasa.lotnisko_wylotu.miasto}</td>
                <td>${flight.trasa.lotnisko_przylotu.miasto}</td>
                <td>${dateText}</td>
                <td>${timeText}</td>
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
        resultsBody.innerHTML =
            `<tr><td colspan="6">Błąd pobierania lotów</td></tr>`;
    }
}

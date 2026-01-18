document.addEventListener('DOMContentLoaded', () => {
    searchFlights(); // opcjonalnie: pokaż wszystkie loty na start
});
function formatDate(dateString) {
    if (!dateString) return '';

    const date = new Date(dateString);

    return date.toLocaleDateString('pl-PL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

/* ===============================
   WYSZUKIWANIE LOTÓW
================================ */
async function searchFlights() {
    const container = document.getElementById('flights-container');
    
    if (!container) {
        console.error("Błąd: Nie znaleziono <div id='flights-container'> w HTML");
        return;
    }

    container.innerHTML = '<div style="text-align:center; padding:20px;">Ładowanie...</div>';

    const dateInput = document.getElementById('date')?.value || '';
    const fromInput = document.getElementById('from')?.value.toLowerCase() || '';
    const toInput = document.getElementById('to')?.value.toLowerCase() || '';

    try {
        const flights = await apiFetch('/loty');

        const filtered = flights.filter(flight => {
            const matchDate = dateInput ? flight.data === dateInput : true;

            const cityFrom =
                flight.trasa?.lotnisko_wylotu?.miasto?.toLowerCase() || '';
            const cityTo =
                flight.trasa?.lotnisko_przylotu?.miasto?.toLowerCase() || '';

            const matchFrom = fromInput ? cityFrom.includes(fromInput) : true;
            const matchTo = toInput ? cityTo.includes(toInput) : true;

            return matchDate && matchFrom && matchTo;
        });

        container.innerHTML = '';

        if (!filtered.length) {
            container.innerHTML =
                '<div class="results-empty" style="text-align:center; padding:30px;">Brak wyników.</div>';
            return;
        }

        filtered.forEach(flight => {
            const cityFrom =
                flight.trasa?.lotnisko_wylotu?.miasto || 'Nieznane';
            const cityTo =
                flight.trasa?.lotnisko_przylotu?.miasto || 'Nieznane';
            const price = flight.cena || 350;

            const departureTime = flight.godzina
                ? flight.godzina.slice(0, 5)
                : '--:--';

            container.innerHTML += `
                <div class="flight-card">
                    <div class="flight-time">${flight.godzina.slice(0,5)}</div>
                    <div class="flight-route">${cityFrom} - ${cityTo}</div>
                    <div class="flight-date">${formatDate(flight.data)}</div>
                    <div class="flight-price">od ${price} zł</div>
                    <div>
                        <button class="buy-btn" onclick='goToSeats(${JSON.stringify(flight)})'>
                            Kup bilet
                        </button>
                    </div>
                </div>
            `;
        });

    } catch (err) {
        console.error('searchFlights error:', err);
        container.innerHTML =
            '<div style="text-align:center; color:red;">Błąd pobierania danych z API.</div>';
    }
}

/* ===============================
   PRZEJŚCIE DO MIEJSC (LARAVEL)
================================ */
function goToSeats(flight) {
    const role = getSessionItem('role');

    if (!role) {
        alert('Aby kupić bilet musisz się zalogować');
        window.location.href = '/login';
        return;
    }

    localStorage.setItem('selectedFlight', JSON.stringify(flight));

    // 🔧 ZAMIANA HTML → ROUTE (Client)
    window.location.href = '/client/seats';
}
document.addEventListener('DOMContentLoaded', () => {
    searchFlights(); // opcjonalnie: pokaż wszystkie loty na start
});

async function searchFlights() {
    const container =
        document.getElementById('resultsBody') ||
        document.getElementById('flights-container');

    if (!container) {
        console.error('Brak kontenera wyników');
        return;
    }

    container.innerHTML = '';

    const date = document.getElementById('date')?.value || '';
    const from = document.getElementById('from')?.value.toLowerCase() || '';
    const to = document.getElementById('to')?.value.toLowerCase() || '';

    try {
        const flights = await apiFetch('/loty');

        const filtered = flights.filter(flight => {
            const flightDate = flight.data?.split('T')[0] || '';

            const cityFrom =
                flight.trasa?.lotnisko_wylotu?.miasto?.toLowerCase() || '';

            const cityTo =
                flight.trasa?.lotnisko_przylotu?.miasto?.toLowerCase() || '';

            return (
                (date ? flightDate === date : true) &&
                (from ? cityFrom.includes(from) : true) &&
                (to ? cityTo.includes(to) : true)
            );
        });

        if (!filtered.length) {
            container.innerHTML =
                container.tagName === 'TBODY'
                    ? `<tr><td colspan="6">Brak wyników</td></tr>`
                    : `<div class="no-results">Brak wyników</div>`;
            return;
        }

        filtered.forEach(flight => {
            const fromCity = flight.trasa.lotnisko_wylotu.miasto;
            const toCity = flight.trasa.lotnisko_przylotu.miasto;
            const dateOnly = flight.data.split('T')[0];
            const time = flight.godzina ?? '--:--';
            const price = flight.cena ?? '---';

            // zostaje, NIE USUWAMY
            let arrivalTime = '--:--';
            if (flight.godzina) {
                const [h, m] = flight.godzina.split(':');
                arrivalTime = `${(parseInt(h) + 2) % 24}:${m}`;
            }

            // WIDOK TABELI (CLIENT)
            if (container.tagName === 'TBODY') {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${fromCity}</td>
                    <td>${toCity}</td>
                    <td>${dateOnly}</td>
                    <td>${time}</td>
                    <td>${price} zł</td>
                    <td>
                        <button class="buy-btn"
                            onclick='goToSeats(${JSON.stringify(flight)})'>
                            Kup bilet
                        </button>
                    </td>
                `;
                container.appendChild(row);
            }

            // WIDOK KART (KASJER / CLIENT)
            if (container.tagName !== 'TBODY') {
                container.innerHTML += `
                    <div class="flight-card">
                        <div class="flight-time">
                            ${time}
                        </div>

                        <div class="flight-route">
                            ${fromCity} - ${toCity}
                        </div>

                        <div class="flight-date">
                            ${dateOnly}
                        </div>

                        <div class="flight-price">
                            od ${price} zł
                        </div>
                    </div>
                `;
            }
        });

    } catch (err) {
        console.error(err);
        container.innerHTML =
            `<div class="no-results">Błąd pobierania lotów</div>`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    searchFlights();
});


function formatDatePL(dateString) {
    if (!dateString) return '—';

    const d = new Date(dateString);
    if (isNaN(d)) return '—';

    return d.toLocaleDateString('pl-PL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}


async function searchFlights() {
    const container =
        document.getElementById('resultsBody') ||
        document.getElementById('flights-container');

    if (!container) {
        console.error('Brak kontenera wyników');
        return;
    }

    container.innerHTML = '';

    const dateInput = document.getElementById('date')?.value || '';
    const fromInput = document.getElementById('from')?.value.toLowerCase() || '';
    const toInput = document.getElementById('to')?.value.toLowerCase() || '';

    const now = new Date();

    try {
        const flights = await apiFetch('/loty');

        const filtered = flights
            .filter(flight => {
                
                if (flight.status !== 'AKTYWNY') return false;
                if (!flight.data || !flight.godzina) return false;

                
                const flightDateTime = new Date(
                    `${flight.data}T${flight.godzina}`
                );

                
                if (flightDateTime < now) return false;

                
                const cityFrom =
                    flight.trasa?.lotnisko_wylotu?.miasto?.toLowerCase() || '';
                const cityTo =
                    flight.trasa?.lotnisko_przylotu?.miasto?.toLowerCase() || '';

                if (fromInput && !cityFrom.includes(fromInput)) return false;
                if (toInput && !cityTo.includes(toInput)) return false;
                if (dateInput && flight.data !== dateInput) return false;

                return true;
            })
            
            .sort((a, b) => {
                const aTime = new Date(`${a.data}T${a.godzina}`);
                const bTime = new Date(`${b.data}T${b.godzina}`);
                return aTime - bTime;
            });

        if (!filtered.length) {
            container.innerHTML =
                container.tagName === 'TBODY'
                    ? `<tr><td colspan="6">Brak wyników</td></tr>`
                    : `<div class="no-results">Brak wyników</div>`;
            return;
        }

        filtered.forEach(flight => {
            const fromCity = flight.trasa?.lotnisko_wylotu?.miasto || '—';
            const toCity = flight.trasa?.lotnisko_przylotu?.miasto || '—';

            const dateText = formatDatePL(flight.data);
            const timeText = flight.godzina.slice(0, 5);

            let price = '—';
            if (Array.isArray(flight.ceny)) {
                const eco = flight.ceny.find(c => c.klasa === 'ECONOMY');
                if (eco?.cena != null) price = eco.cena;
            }

           
            if (container.tagName === 'TBODY') {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${fromCity}</td>
                    <td>${toCity}</td>
                    <td>${dateText}</td>
                    <td>${timeText}</td>
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

           
            if (container.tagName !== 'TBODY') {
                container.innerHTML += `
                    <div class="flight-card">
                        <div class="flight-time">${timeText}</div>
                        <div class="flight-route">
                            ${fromCity} - ${toCity}
                        </div>
                        <div class="flight-date">${dateText}</div>
                        <div class="flight-price">od ${price} zł</div>
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

document.addEventListener('DOMContentLoaded', searchFlights);

function formatDate(dateString) {
    if (!dateString) return '';
    const [y, m, d] = dateString.split('-');
    return `${d}.${m}.${y}`;
}

async function searchFlights() {
    const container = document.getElementById('flights-container');
    if (!container) return;

    container.innerHTML = '<div style="text-align:center; padding:20px;">Ładowanie...</div>';

    const dateInput = document.getElementById('date')?.value || '';
    const fromInput = document.getElementById('from')?.value.toLowerCase() || '';
    const toInput = document.getElementById('to')?.value.toLowerCase() || '';

    const now = new Date();

    try {
        const flights = await apiFetch('/loty');

        const filtered = flights.filter(flight => {
            
            if (flight.status !== 'AKTYWNY') return false;
            if (!flight.data || !flight.godzina) return false;

            
            const [y, m, d] = flight.data.split('-');
            const [hh, mm] = flight.godzina.split(':');

            const flightDateTime = new Date(
                Number(y),
                Number(m) - 1,
                Number(d),
                Number(hh),
                Number(mm)
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
        });

        container.innerHTML = '';

        if (!filtered.length) {
            container.innerHTML =
                '<div style="text-align:center; padding:30px;">Brak wyników.</div>';
            return;
        }

        filtered.forEach(flight => {
            const cityFrom = flight.trasa?.lotnisko_wylotu?.miasto || '—';
            const cityTo = flight.trasa?.lotnisko_przylotu?.miasto || '—';

            const dateText = new Date(flight.data).toLocaleDateString('pl-PL', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
            const timeText = flight.godzina.slice(0, 5);
            const price = flight.cena || 350;

            container.innerHTML += `
                <div class="flight-card">
                    <div class="flight-time">${timeText}</div>
                    <div class="flight-route">${cityFrom} - ${cityTo}</div>
                    <div class="flight-date">${dateText}</div>
                    <div class="flight-price">od ${price} zł</div>
                    <div>
                        <button class="buy-btn" onclick='goToSeats(${JSON.stringify(flight)})'>
                            Kup bilet
                        </button>
                    </div>
                </div>
            `;
        });

    } catch (e) {
        console.error(e);
        container.innerHTML =
            '<div style="text-align:center; color:red;">Błąd pobierania danych.</div>';
    }
}

function goToSeats(flight) {
    const role = getSessionItem('role');

    if (!role) {
        alert('Aby kupić bilet musisz się zalogować');
        window.location.href = '/login';
        return;
    }

    localStorage.setItem('selectedFlight', JSON.stringify(flight));
    window.location.href = '/client/seats';
}

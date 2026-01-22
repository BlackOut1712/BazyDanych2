document.addEventListener('DOMContentLoaded', () => {
    searchFlights();
});

/* ===============================
   FORMAT DATY DD.MM.RRRR
================================ */
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

/* ===============================
   GŁÓWNE WYSZUKIWANIE LOTÓW
================================ */
async function searchFlights() {
    const container =
        document.getElementById('resultsBody') ||
        document.getElementById('flights-container');

    if (!container) {
        console.error('Brak kontenera wyników');
        return;
    }

    container.innerHTML =
        '<div style="text-align:center; padding:20px;">Ładowanie...</div>';

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

        container.innerHTML = '';

        if (!filtered.length) {
            container.innerHTML = `
                <div class="results-empty" style="text-align:center; padding:30px;">
                    Brak wyników
                </div>`;
            return;
        }

        filtered.forEach(flight => {
            const cityFrom =
                flight.trasa?.lotnisko_wylotu?.miasto || '—';
            const cityTo =
                flight.trasa?.lotnisko_przylotu?.miasto || '—';

            const dateText = formatDatePL(flight.data);
            const timeText = flight.godzina.slice(0, 5);

            let price = 'Brak ceny';
            if (Array.isArray(flight.ceny)) {
                const eco = flight.ceny.find(c => c.klasa === 'ECONOMY');
                if (eco?.cena != null) {
                    price = `${eco.cena} zł`;
                }
            }

            container.innerHTML += `
                <div class="flight-card">
                    <div class="flight-time">${timeText}</div>
                    <div class="flight-route">${cityFrom} - ${cityTo}</div>
                    <div class="flight-date">${dateText}</div>
                    <div class="flight-price">od ${price}</div>
                    <div>
                        <button class="buy-btn"
                            onclick='goToSeats(${JSON.stringify(flight)})'>
                            Kup bilet
                        </button>
                    </div>
                </div>
            `;
        });

    } catch (err) {
        console.error('searchFlights error:', err);
        container.innerHTML =
            '<div style="text-align:center; color:red;">Błąd pobierania danych.</div>';
    }
}


window.goToSeats = function (flight) {
    if (!flight || !flight.id) {
        alert('Błąd: nieprawidłowy lot');
        return;
    }

    const selectedFlight = {
        id: flight.id,
        from: flight.trasa?.lotnisko_wylotu?.miasto || '—',
        to: flight.trasa?.lotnisko_przylotu?.miasto || '—',
        date: flight.data,
        time: flight.godzina.slice(0, 5),
        ceny: Array.isArray(flight.ceny) ? flight.ceny : []
    };

    localStorage.setItem(
        'selectedFlight',
        JSON.stringify(selectedFlight)
    );

    window.location.href = '/client/seats';
};

document.addEventListener('DOMContentLoaded', () => {
    searchFlights(); // opcjonalnie: pokaż wszystkie loty na start
});

/* ===============================
   NORMALIZACJA DATY (DODANE)
================================ */
function normalizeDate(dateString) {
    if (!dateString) return 0;
    return new Date(dateString.split('T')[0]).getTime();
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

    const date = document.getElementById('date')?.value || '';
    const from = document.getElementById('from')?.value.toLowerCase() || '';
    const to = document.getElementById('to')?.value.toLowerCase() || '';

    try {
        const flights = await apiFetch('/loty');

        const filtered = flights
            .filter(flight => {
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
            })
            /* ===============================
               SORTOWANIE PO DACIE (DODANE)
            ================================ */
            .sort((a, b) => {
                return normalizeDate(a.data) - normalizeDate(b.data);
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
                flight.trasa?.lotnisko_wylotu?.miasto || 'Nieznane';
            const cityTo =
                flight.trasa?.lotnisko_przylotu?.miasto || 'Nieznane';

            const date = flight.data
                ? flight.data.split('T')[0]
                : '--';

            const time = flight.godzina
                ? flight.godzina.substring(0, 5)
                : '--:--';

            let price = 'Brak ceny';

            if (Array.isArray(flight.ceny)) {
                const economy = flight.ceny.find(
                    c => c.klasa === 'ECONOMY'
                );
                if (economy) {
                    price = `${economy.cena} zł`;
                }
            }

            container.innerHTML += `
                <div class="flight-card">
                    <div class="flight-time">${time}</div>
                    <div class="flight-route">${cityFrom} - ${cityTo}</div>
                    <div class="flight-date">${date}</div>
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
            '<div style="text-align:center; color:red;">Błąd pobierania danych z API.</div>';
    }
}

/* ===============================
   WYBÓR LOTU → MIEJSCA
   🔧 POPRAWIONE + UZUPEŁNIONE
================================ */
window.goToSeats = function (flight) {

    if (!flight || !flight.id) {
        alert('Błąd: nieprawidłowy lot');
        return;
    }

    // 🔧 DODANE: komplet danych potrzebnych dalej
    const selectedFlight = {
        id: flight.id,                         // 🔑 KLUCZOWE
        lot_id: flight.id,                     // alias – bezpieczeństwo

        from: flight.trasa?.lotnisko_wylotu?.miasto || '—',
        to: flight.trasa?.lotnisko_przylotu?.miasto || '—',

        date: flight.data ? flight.data.split('T')[0] : null,
        time: flight.godzina ? flight.godzina.substring(0, 5) : null,

        ceny: Array.isArray(flight.ceny) ? flight.ceny : [],

        trasa: flight.trasa || null             // 🔧 na przyszłość
    };

    console.log('ZAPISANY LOT (OK):', selectedFlight);

    localStorage.setItem(
        'selectedFlight',
        JSON.stringify(selectedFlight)
    );

    // 🔐 zabezpieczenie sesji
    if (typeof updateActivity === 'function') {
        updateActivity();
    }

    window.location.href = '/client/seats';
};

const API_URL = 'http://127.0.0.1:8000/api';

/**
 * Klikane przyciskiem "Szukaj" - Wersja KAFELKOWA
 */
async function searchFlights() {
    const container = document.getElementById('flights-container');
    
    if (!container) {
        console.error("Błąd: Nie znaleziono <div id='flights-container'> w HTML");
        return;
    }

    container.innerHTML = '<div style="text-align:center; padding:20px;">Ładowanie...</div>';

    // Pobieramy dane z formularza
    const dateInput = document.getElementById('date')?.value || '';
    const fromInput = document.getElementById('from')?.value.toLowerCase() || '';
    const toInput = document.getElementById('to')?.value.toLowerCase() || '';

    try {
        const flights = await apiFetch('/loty');

        const filtered = flights.filter(flight => {
            const matchDate = dateInput ? flight.data === dateInput : true;
            
            const cityFrom = flight.trasa?.lotnisko_wylotu?.miasto?.toLowerCase() || '';
            const cityTo = flight.trasa?.lotnisko_przylotu?.miasto?.toLowerCase() || '';

            const matchFrom = fromInput ? cityFrom.includes(fromInput) : true;
            const matchTo = toInput ? cityTo.includes(toInput) : true;

            return matchDate && matchFrom && matchTo;
        });

        container.innerHTML = '';

        if (!filtered.length) {
            container.innerHTML = '<div class="results-empty" style="text-align:center; padding:30px;">Brak wyników.</div>';
            return;
        }

        // Generowanie KAFELKÓW
        filtered.forEach(flight => {
            const cityFrom = flight.trasa?.lotnisko_wylotu?.miasto || 'Nieznane';
            const cityTo = flight.trasa?.lotnisko_przylotu?.miasto || 'Nieznane';
            const price = flight.cena || 350; 
            
            let arrivalTime = "??:??";
            if (flight.godzina) {
                const [h, m] = flight.godzina.split(':');
                const arrivalH = (parseInt(h) + 2) % 24;
                arrivalTime = `${arrivalH.toString().padStart(2, '0')}:${m}`;
            }

            const cardHTML = `
                <div class="flight-card">
                    <div class="flight-time">${flight.godzina} - ${arrivalTime}</div>
                    <div class="flight-route">${cityFrom} - ${cityTo}</div>
                    <div class="flight-date">${flight.data}</div>
                    <div class="flight-price">od ${price} zł</div>
                    <div>
                        <button class="buy-btn" onclick='goToSeats(${JSON.stringify(flight)})'>
                            Kup bilet
                        </button>
                    </div>
                </div>
            `;
            
            container.innerHTML += cardHTML;
        });

    } catch (err) {
        console.error(err);
        container.innerHTML = '<div style="text-align:center; color:red;">Błąd pobierania danych z API.</div>';
    }
}

/**
 * Funkcja do obsługi przycisku "Kup bilet"
 */
function goToSeats(flight) {
    const role = getSessionItem('role');

    if (!role) {
        alert('Aby kupić bilet musisz się zalogować');
        window.location.href = 'login.html';
        return;
    }

    localStorage.setItem('selectedFlight', JSON.stringify(flight));
    window.location.href = 'seats.html';
}

async function apiFetch(endpoint, options = {}) {
    const role = getSessionItem('role');

    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {})
    };

    if (role) {
        headers['X-User-Role'] = role.toLowerCase();
    }

    //LOG
    console.log("Wysyłam nagłówki:", headers);

    const response = await fetch(API_URL + endpoint, {
        ...options,
        headers
    });

    if (!response.ok) {
        let error = {};
        try {
            error = await response.json();
        } catch (e) {
            throw new Error('Błąd serwera');
        }
        throw error;
    }

    return response.json();
}

/**
 * Pobiera dane z sessionStorage LUB localStorage (priorytet ma sesja aktywna)
 */
function getSessionItem(key) {
    return sessionStorage.getItem(key) || localStorage.getItem(key);
}
const API_URL = 'http://127.0.0.1:8000/api';

/**
 * Klikane przyciskiem "Szukaj"
 */
function searchFlights() {
    const date = document.getElementById('date').value;
    const from = document.getElementById('from').value;
    const to = document.getElementById('to').value;

    // Na start: pobieramy wszystkie loty
    fetch(`${API_URL}/loty`)
        .then(res => res.json())
        .then(loty => {
            // Filtrowanie po froncie (na razie)
            const filtered = loty.filter(lot => {
                const matchDate = date ? lot.data === date : true;
                const matchFrom = from
                    ? lot.trasa?.lotnisko_wylotu?.miasto
                          ?.toLowerCase()
                          .includes(from.toLowerCase())
                    : true;
                const matchTo = to
                    ? lot.trasa?.lotnisko_przylotu?.miasto
                          ?.toLowerCase()
                          .includes(to.toLowerCase())
                    : true;

                return matchDate && matchFrom && matchTo;
            });

            renderFlights(filtered);
        })
        .catch(err => {
            console.error('Błąd API:', err);
        });
}

/**
 * Renderowanie wyników
 */
function renderFlights(loty) {
    const container = document.getElementById('resultsList');
    container.innerHTML = '';

    if (loty.length === 0) {
        container.innerHTML = 'Brak wyników.';
        return;
    }

    loty.forEach(lot => {
        const row = document.createElement('div');
        row.className = 'results-row';

        row.innerHTML = `
            <span>${lot.godzina}</span>
            <span>
                ${lot.trasa?.lotnisko_wylotu?.miasto}
                →
                ${lot.trasa?.lotnisko_przylotu?.miasto}
            </span>
            <span>${lot.data}</span>
            <span>350 zł</span>
            <span><button>Kup</button></span>
        `;

        container.appendChild(row);
    });
}
async function apiFetch(endpoint, options = {}) {
    const role = localStorage.getItem('role');

    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {})
    };

    if (role) {
        headers['X-User-Role'] = role;
    }

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
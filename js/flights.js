document.addEventListener('DOMContentLoaded', () => {
    checkSession(['MENADZER']);
    loadFlights();
});

/* ======================================================
   POMOCNICZE – IATA
====================================================== */

function generateIataCode(city) {
    return city
        .toUpperCase()
        .replace(/[^A-Z]/g, '')
        .slice(0, 3)
        .padEnd(3, 'X');
}

/* ======================================================
   LOTNISKA – POBIERZ LUB UTWÓRZ
====================================================== */

async function getOrCreateAirport(city, country) {
    const airports = await apiFetch('/lotniska');

    const found = airports.find(a =>
        a.miasto.toLowerCase() === city.toLowerCase() &&
        a.kraj.toLowerCase() === country.toLowerCase()
    );

    if (found) return found;

    const iata = generateIataCode(city);

    return apiFetch('/lotniska', {
        method: 'POST',
        body: JSON.stringify({
            nazwa: `${city} Airport`,
            kod_iata: iata,
            miasto: city,
            kraj: country
        })
    });
}

/* ======================================================
   LISTA LOTÓW
====================================================== */

async function loadFlights() {
    const body = document.getElementById('flightsBody');

    body.innerHTML = `
        <tr>
            <td colspan="5" class="table-loading">Ładowanie...</td>
        </tr>
    `;

    try {
        const flights = await apiFetch('/loty');
        body.innerHTML = '';

        if (!flights.length) {
            body.innerHTML = `
                <tr>
                    <td colspan="5" class="table-loading">Brak lotów</td>
                </tr>
            `;
            return;
        }

        flights.forEach(f => {
            const tr = document.createElement('tr');

            const from = f.trasa?.lotnisko_wylotu?.miasto ?? '?';
            const to = f.trasa?.lotnisko_przylotu?.miasto ?? '?';
            const isActive = f.status === 'AKTYWNY';

            tr.innerHTML = `
                <td>${from} → ${to}</td>
                <td>${f.data}</td>
                <td>${f.godzina}</td>
                <td>
                    <span class="role-badge ${isActive ? 'role-MENADZER' : 'role-KASJER'}">
                        ${f.status}
                    </span>
                </td>
                <td class="actions">
                    <button class="icon-btn danger" onclick="deleteFlight(${f.id})">🗑️</button>
                </td>
            `;

            body.appendChild(tr);
        });

    } catch (e) {
        console.error(e);
        body.innerHTML = `
            <tr>
                <td colspan="5" class="table-loading">Błąd pobierania lotów</td>
            </tr>
        `;
    }
}

/* ======================================================
   TWORZENIE LOTU (LOTNISKA → TRASA → LOT)
====================================================== */

async function createFullFlight() {
    const result = document.getElementById('flightResult');

    const fromCity = document.getElementById('fromCity').value.trim();
    const fromCountry = document.getElementById('fromCountry').value.trim();
    const toCity = document.getElementById('toCity').value.trim();
    const toCountry = document.getElementById('toCountry').value.trim();
    const data = document.getElementById('data').value;
    const godzina = document.getElementById('godzina').value;
    const status = document.getElementById('status').value;

    if (!fromCity || !fromCountry || !toCity || !toCountry || !data || !godzina) {
        result.innerHTML = '<p style="color:red">Uzupełnij wszystkie pola</p>';
        return;
    }

    if (fromCity.toLowerCase() === toCity.toLowerCase()) {
        result.innerHTML = '<p style="color:red">Miasto wylotu i przylotu nie mogą być takie same</p>';
        return;
    }

    try {
        // lotniska
        const fromAirport = await getOrCreateAirport(fromCity, fromCountry);
        const toAirport = await getOrCreateAirport(toCity, toCountry);

        if (fromAirport.id === toAirport.id) {
            result.innerHTML = '<p style="color:red">Lotniska nie mogą być identyczne</p>';
            return;
        }

        // trasa
        const route = await apiFetch('/trasy', {
            method: 'POST',
            body: JSON.stringify({
                lotnisko_wylotu_id: fromAirport.id,
                lotnisko_przylotu_id: toAirport.id,
                czas_lotu: 60
            })
        });

        // lot
        await apiFetch('/loty', {
            method: 'POST',
            body: JSON.stringify({
                trasa_id: route.id,
                data,
                godzina,
                status
            })
        });

        result.innerHTML = '<p style="color:green">Lot został dodany</p>';

        hideAddFlightForm();
        loadFlights();

    } catch (e) {
        console.error(e);
        result.innerHTML = '<p style="color:red">Błąd dodawania lotu</p>';
    }
}

/* ======================================================
   USUWANIE LOTU
====================================================== */

async function deleteFlight(id) {
    if (!confirm('Czy na pewno chcesz usunąć ten lot?')) return;

    try {
        await apiFetch(`/loty/${id}`, { method: 'DELETE' });
        loadFlights();
    } catch (e) {
        console.error(e);
        alert('Błąd usuwania lotu');
    }
}

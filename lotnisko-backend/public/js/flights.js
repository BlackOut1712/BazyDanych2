let isEditMode = false;

document.addEventListener('DOMContentLoaded', () => {
    // Dostęp tylko MENADZER
    checkSession(['MENADZER']);
    loadFlights();
    loadSamoloty();
});

/* ============================
   FORMAT DATY
============================ */
function formatDatePL(dateString) {
    if (!dateString) return '—';

    const d = new Date(dateString);
    if (isNaN(d)) return dateString;

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    return `${day}.${month}.${year}`;
}

/* ============================
   SAMOLOTY
============================ */
async function loadSamoloty() {
    const select = document.getElementById('samolotSelect');
    if (!select) return;

    select.innerHTML = `<option value="">-- wybierz samolot --</option>`;

    try {
        const samoloty = await apiFetch('/samoloty');
        samoloty.forEach(s => {
            select.innerHTML += `
                <option value="${s.id}">
                    ${s.model} (${s.liczba_miejsc})
                </option>
            `;
        });
    } catch (e) {
        console.error('Błąd ładowania samolotów:', e);
    }
}

/* ============================
   LISTA LOTÓW
============================ */
async function loadFlights() {
    const body = document.getElementById('flightsBody');
    if (!body) return;

    body.innerHTML =
        `<tr><td colspan="6" class="table-loading">Ładowanie...</td></tr>`;

    try {
        const flights = await apiFetch('/loty');

        if (!flights || flights.length === 0) {
            body.innerHTML =
                `<tr><td colspan="6">Brak lotów</td></tr>`;
            return;
        }

        let html = '';

        flights.forEach(f => {
            const from = f.trasa?.lotnisko_wylotu?.miasto ?? '?';
            const to = f.trasa?.lotnisko_przylotu?.miasto ?? '?';

            const ecoPrice = Array.isArray(f.ceny)
                ? f.ceny.find(c => c.klasa === 'ECONOMY')?.cena
                : null;

            const busPrice = Array.isArray(f.ceny)
                ? f.ceny.find(c => c.klasa === 'BUSINESS')?.cena
                : null;

            html += `
                <tr>
                    <td>${from} → ${to}</td>
                    <td>${formatDatePL(f.data)}</td>
                    <td>${f.godzina ?? ''}</td>

                    <td>
                        ${
                            ecoPrice && busPrice
                                ? `
                                    <div>Eco: <b>${ecoPrice} zł</b></div>
                                    <div>Biz: <b>${busPrice} zł</b></div>
                                  `
                                : '—'
                        }
                    </td>

                    <td>
                        <span class="role-badge ${
                            f.status === 'AKTYWNY'
                                ? 'role-MENADZER'
                                : 'role-KASJER'
                        }">
                            ${f.status}
                        </span>
                    </td>

                    <td class="actions">
                        <button class="icon-btn"
                            onclick="editFlight(${f.id})">✏️</button>
                        <button class="icon-btn danger"
                            onclick="deleteFlight(${f.id})">🗑️</button>
                    </td>
                </tr>
            `;
        });

        body.innerHTML = html;

    } catch (e) {
        console.error('Błąd ładowania lotów:', e);
        body.innerHTML =
            `<tr><td colspan="6">Błąd pobierania lotów</td></tr>`;
    }
}

/* ============================
   FORMULARZ
============================ */
function showFlightForm() {
    const section = document.getElementById('flightFormSection');
    if (!section) return;

    section.style.display = 'block';
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
}

function hideFlightForm() {
    const section = document.getElementById('flightFormSection');
    if (!section) return;

    section.style.display = 'none';
}

/* ============================
   DODAWANIE LOTU
============================ */
function addFlight() {
    isEditMode = false;

    document.getElementById('flightFormTitle').innerText = 'Dodaj lot';
    document.getElementById('flightId').value = '';

    document.getElementById('samolotSelect').disabled = false;
    document.getElementById('priceRange').value = '';

    showFlightForm();
}

/* ============================
   ZAPIS LOTU (ADD + EDIT)
============================ */
async function saveFlight() {
    const id = document.getElementById('flightId').value;

    const priceRangeEl = document.getElementById('priceRange');
    const priceRange = priceRangeEl ? priceRangeEl.value : '';

    let cena_economy = null;
    let cena_business = null;

    if (priceRange) {
        const parts = priceRange.split('|');
        cena_economy = Number(parts[0]);
        cena_business = Number(parts[1]);
    }

    // wymagaj cen tylko przy dodawaniu
    if (
        !isEditMode &&
        (
            !priceRange ||
            Number.isNaN(cena_economy) ||
            Number.isNaN(cena_business)
        )
    ) {
        alert('Musisz wybrać zakres cen (Economy / Business) dla nowego lotu');
        return;
    }

    const payload = {
        data: document.getElementById('data').value,
        godzina: document.getElementById('godzina').value,
        status: document.getElementById('status').value,
        trasa_id: await prepareRoute()
    };

    if (
        cena_economy !== null &&
        cena_business !== null &&
        !Number.isNaN(cena_economy) &&
        !Number.isNaN(cena_business)
    ) {
        payload.cena_economy = cena_economy;
        payload.cena_business = cena_business;
    }

    if (!isEditMode) {
        payload.samolot_id =
            Number(document.getElementById('samolotSelect').value);
    }

    try {
        if (id) {
            await apiFetch(`/loty/${id}`, {
                method: 'PUT',
                body: JSON.stringify(payload)
            });
        } else {
            await apiFetch('/loty', {
                method: 'POST',
                body: JSON.stringify(payload)
            });
        }

        hideFlightForm();
        loadFlights();

    } catch (e) {
        console.error('Błąd zapisu lotu:', e);
        alert('Nie udało się zapisać lotu');
    }
}

/* ============================
   EDYCJA LOTU
============================ */
async function editFlight(id) {
    isEditMode = true;

    const flights = await apiFetch('/loty');
    const f = flights.find(x => x.id === id);
    if (!f) return;

    document.getElementById('flightFormTitle').innerText = 'Edytuj lot';
    document.getElementById('flightId').value = f.id;

    document.getElementById('fromCity').value =
        f.trasa.lotnisko_wylotu.miasto;
    document.getElementById('fromCountry').value =
        f.trasa.lotnisko_wylotu.kraj;
    document.getElementById('toCity').value =
        f.trasa.lotnisko_przylotu.miasto;
    document.getElementById('toCountry').value =
        f.trasa.lotnisko_przylotu.kraj;

    document.getElementById('data').value = f.data.slice(0, 10);
    document.getElementById('godzina').value = f.godzina;
    document.getElementById('status').value = f.status;

    document.getElementById('samolotSelect').value = f.samolot_id;
    document.getElementById('samolotSelect').disabled = true;

    if (Array.isArray(f.ceny)) {
        const eco = f.ceny.find(c => c.klasa === 'ECONOMY')?.cena;
        const bus = f.ceny.find(c => c.klasa === 'BUSINESS')?.cena;
        if (eco !== undefined && bus !== undefined) {
            document.getElementById('priceRange').value = `${eco}|${bus}`;
        }
    }

    showFlightForm();
}

/* ============================
   USUWANIE LOTU
============================ */
async function deleteFlight(id) {
    if (!confirm('Usunąć lot?')) return;

    try {
        await apiFetch(`/loty/${id}`, { method: 'DELETE' });
        loadFlights();
    } catch (e) {
        console.error('Błąd usuwania lotu:', e);
        alert('Nie udało się usunąć lotu');
    }
}

/* ============================
   IATA
============================ */
function generateIataCode(city) {
    return city
        .toUpperCase()
        .replace(/[^A-Z]/g, '')
        .slice(0, 3)
        .padEnd(3, 'X');
}

/* ============================
   LOTNISKA
============================ */
async function getOrCreateAirport(city, country) {
    const airports = await apiFetch('/lotniska');

    const found = airports.find(a =>
        a.miasto.toLowerCase() === city.toLowerCase() &&
        a.kraj.toLowerCase() === country.toLowerCase()
    );

    if (found) return found;

    return await apiFetch('/lotniska', {
        method: 'POST',
        body: JSON.stringify({
            nazwa: `${city} Airport`,
            kod_iata: generateIataCode(city),
            miasto: city,
            kraj: country
        })
    });
}

/* ============================
   TRASY
============================ */
async function getOrCreateRoute(fromId, toId) {
    const trasy = await apiFetch('/trasy');

    const found = trasy.find(t =>
        t.lotnisko_wylotu_id === fromId &&
        t.lotnisko_przylotu_id === toId
    );

    if (found) return found;

    return await apiFetch('/trasy', {
        method: 'POST',
        body: JSON.stringify({
            lotnisko_wylotu_id: fromId,
            lotnisko_przylotu_id: toId,
            czas_lotu: 60
        })
    });
}

/* ============================
   TRASA (ADD + EDIT)
============================ */
async function prepareRoute() {
    const fromCity = document.getElementById('fromCity').value.trim();
    const fromCountry = document.getElementById('fromCountry').value.trim();
    const toCity = document.getElementById('toCity').value.trim();
    const toCountry = document.getElementById('toCountry').value.trim();

    const from = await getOrCreateAirport(fromCity, fromCountry);
    const to = await getOrCreateAirport(toCity, toCountry);
    const route = await getOrCreateRoute(from.id, to.id);

    return route.id;
}

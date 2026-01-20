document.addEventListener('DOMContentLoaded', () => {
    checkSession(['KASJER', 'MENADZER']);
    initSell();

    const priceInput = document.getElementById('priceInput');
    if (priceInput) {
        priceInput.addEventListener('input', e => {
            document.getElementById('summaryPrice').textContent =
                e.target.value || '—';
        });
    }

    /* 🔥 NOWE – reakcja na wybór miejsca z SELECT */
    const miejsceSelect = document.getElementById('miejsceSelect');
    if (miejsceSelect) {
        miejsceSelect.addEventListener('change', () => {
            const seatId = miejsceSelect.value;
            if (!seatId) return;

            const seat = cachedSeats.find(s => s.id == seatId);
            if (!seat) return;

            const el = document.querySelector(`.seat[data-seat-id="${seat.id}"]`);
            selectSeat(seat.id, seat.klasa, seat.numer, el);
        });
    }
});

let isProcessing = false;
let selectedSeatId = null;
let selectedSeatClass = null;
let selectedClient = null;
let cachedLots = [];
let selectedLot = null;
let cachedSeats = [];

/* ⛔ fallback */
const PRICE_BY_CLASS = {
    ECONOMY: 300,
    BUSINESS: 600,
    FIRST: 1000
};

/* ============================
   FORMAT DATY LOTU
============================ */
function formatLotDate(dateString, timeString) {
    if (!dateString) return '—';

    const d = new Date(dateString);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    return `${day}.${month}.${year} ${timeString || ''}`.trim();
}

/* ============================
   INIT
============================ */
async function initSell() {
    await loadKlients();
    await loadLots();

    const lotSelect = document.getElementById('lotSelect');
    if (lotSelect) {
        lotSelect.addEventListener('change', async () => {
            resetSeatSelection();
            selectedLot = cachedLots.find(l => l.id == lotSelect.value) || null;
            await loadSeatsForLot();
            updateSummaryLot();
        });
    }
}

function resetSeatSelection() {
    selectedSeatId = null;
    selectedSeatClass = null;

    document.getElementById('summarySeat').textContent = '—';
    document.getElementById('summaryPrice').textContent = '—';
    document.getElementById('priceInput').value = '';

    document.getElementById('seatMap').innerHTML = '';
    const sel = document.getElementById('miejsceSelect');
    sel.innerHTML = `<option value="">-- wybierz miejsce --</option>`;
    sel.disabled = true;
}

/* ============================
   KLIENCI
============================ */
async function loadKlients() {
    const select = document.getElementById('klientSelect');
    if (!select) return;

    select.innerHTML = `<option value="">Ładowanie klientów...</option>`;

    const klients = await apiFetch('/klienci');
    select.innerHTML = `<option value="">-- wybierz klienta --</option>`;

    klients.forEach(k => {
        select.innerHTML += `
            <option value="${k.id}">
                ${k.imie} ${k.nazwisko} (${k.pesel})
            </option>
        `;
    });

    select.addEventListener('change', () => {
        const opt = select.options[select.selectedIndex];
        document.getElementById('summaryClient').textContent =
            opt.value ? opt.textContent : '—';

        selectedClient = klients.find(k => k.id == opt.value) || null;
    });
}

/* ============================
   LOTY
============================ */
async function loadLots() {
    const select = document.getElementById('lotSelect');
    if (!select) return;

    select.innerHTML = `<option value="">Ładowanie lotów...</option>`;

    const lots = await apiFetch('/loty');
    cachedLots = lots;

    select.innerHTML = `<option value="">-- wybierz lot --</option>`;

    lots.forEach(l => {
        select.innerHTML += `
            <option value="${l.id}">
                ${l.trasa.lotnisko_wylotu.miasto}
                →
                ${l.trasa.lotnisko_przylotu.miasto}
                (${formatLotDate(l.data, l.godzina)})
            </option>
        `;
    });
}

function updateSummaryLot() {
    if (!selectedLot) {
        document.getElementById('summaryLot').textContent = '—';
        return;
    }

    document.getElementById('summaryLot').textContent =
        `${selectedLot.trasa.lotnisko_wylotu.miasto} → ` +
        `${selectedLot.trasa.lotnisko_przylotu.miasto} ` +
        `(${formatLotDate(selectedLot.data, selectedLot.godzina)})`;
}

/* ============================
   MAPA MIEJSC
============================ */
async function loadSeatsForLot() {
    const lotId = document.getElementById('lotSelect').value;
    const map = document.getElementById('seatMap');
    const select = document.getElementById('miejsceSelect');

    map.innerHTML = '';
    select.innerHTML = `<option value="">-- wybierz miejsce --</option>`;
    select.disabled = true;

    if (!lotId) return;

    const miejsca = await apiFetch(`/loty/${lotId}/miejsca`);
    cachedSeats = miejsca;

    if (!Array.isArray(miejsca) || miejsca.length === 0) {
        map.innerHTML = `<p>Brak miejsc w samolocie</p>`;
        return;
    }

    const byClass = { FIRST: [], BUSINESS: [], ECONOMY: [] };
    miejsca.forEach(m => byClass[String(m.klasa).toUpperCase()]?.push(m));

    function createAisle() {
        const div = document.createElement('div');
        div.className = 'seat-aisle';
        return div;
    }

    const renderSection = (label, seats) => {
        if (!seats.length) return;

        const header = document.createElement('div');
        header.className = 'class-section';
        header.textContent = label;
        map.appendChild(header);

        const rows = {};
        seats.forEach(m => {
            const row = m.numer.match(/\d+/)?.[0];
            rows[row] ??= [];
            rows[row].push(m);
        });

        Object.keys(rows).sort((a, b) => a - b).forEach(row => {
            const rowLabel = document.createElement('div');
            rowLabel.className = 'row-label';
            rowLabel.textContent = row;
            map.appendChild(rowLabel);

            const rowSeats = [...rows[row]].sort((a, b) =>
                a.numer.localeCompare(b.numer)
            );

            rowSeats.forEach((m, index) => {
                const seat = document.createElement('div');
                seat.className = `seat ${m.klasa.toLowerCase()} ${m.zajete ? 'taken' : ''}`;
                seat.textContent = m.numer.slice(-1);
                seat.dataset.seatId = m.id;

                if (!m.zajete) {
                    seat.onclick = () => selectSeat(m.id, m.klasa, m.numer, seat);
                    select.innerHTML += `<option value="${m.id}">${m.numer} (${m.klasa})</option>`;
                }

                map.appendChild(seat);
                if (index === 2) map.appendChild(createAisle());
            });
        });
    };

    renderSection('FIRST CLASS', byClass.FIRST);
    renderSection('BUSINESS CLASS', byClass.BUSINESS);
    renderSection('ECONOMY CLASS', byClass.ECONOMY);

    select.disabled = false;
}

/* ============================
   WYBÓR MIEJSCA → CENA Z BAZY
============================ */
function selectSeat(seatId, seatClass, seatNumber, element) {
    document.querySelectorAll('.seat.selected')
        .forEach(s => s.classList.remove('selected'));

    element.classList.add('selected');

    selectedSeatId = seatId;
    selectedSeatClass = seatClass;

    document.getElementById('miejsceSelect').value = seatId;
    document.getElementById('summarySeat').textContent =
        `${seatNumber} (${seatClass})`;

    let cena = null;

    /* 🔍 DEBUG – ZOBACZ CO NAPRAWDĘ MASZ */
    console.log('selectedLot:', selectedLot);
    console.log('selectedLot.ceny:', selectedLot?.ceny);
    console.log('seatClass:', seatClass);

    /* ✅ NORMALIZACJA KLASY */
    if (selectedLot && Array.isArray(selectedLot.ceny)) {
        const found = selectedLot.ceny.find(c =>
            String(c.klasa).toUpperCase() === String(seatClass).toUpperCase()
        );

        if (found && found.cena !== null) {
            cena = Number(found.cena);
        }
    }

    /* 🧯 AWARYJNY FALLBACK */
    if (cena === null && PRICE_BY_CLASS[seatClass.toUpperCase()]) {
        cena = Number(PRICE_BY_CLASS[seatClass.toUpperCase()]);
    }

    /* ❌ NADAL BRAK CENY */
    if (cena === null || isNaN(cena)) {
        document.getElementById('priceInput').value = '';
        document.getElementById('summaryPrice').textContent = '—';
        return;
    }

    /* ✅ UZUPEŁNIENIE */
    document.getElementById('priceInput').value = cena;
    document.getElementById('summaryPrice').textContent = cena;
}


/* ============================
   SPRZEDAŻ → BLIK
============================ */
async function sellTicket() {
    if (isProcessing) return;
    isProcessing = true;

    const klient_id = document.getElementById('klientSelect').value;
    const miejsce_id = selectedSeatId || document.getElementById('miejsceSelect').value;

    const imie_pasazera = document.getElementById('passengerFirstName').value.trim();
    const nazwisko_pasazera = document.getElementById('passengerLastName').value.trim();
    const pesel_pasazera = document.getElementById('passengerPesel').value.trim();

    if (!klient_id || !miejsce_id || !imie_pasazera || !nazwisko_pasazera || !pesel_pasazera) {
        document.getElementById('sellResult').innerHTML =
            `<p style="color:red">Uzupełnij wszystkie pola</p>`;
        isProcessing = false;
        return;
    }

    let rezerwacja = null;

    try {
        // 1️⃣ PRÓBA UTWORZENIA REZERWACJI
        rezerwacja = await apiFetch('/rezerwacje', {
            method: 'POST',
            body: JSON.stringify({ klient_id, miejsce_id })
        });

    } catch (e) {
        console.warn('Rezerwacja już istnieje – próbuję pobrać istniejącą');

        // 2️⃣ JEŚLI JUŻ ISTNIEJE → POBIERZ ISTNIEJĄCĄ
        try {
            rezerwacja = await apiFetch(`/miejsca/${miejsce_id}/rezerwacja`);
        } catch (err) {
            console.error(err);
            document.getElementById('sellResult').innerHTML =
                `<p style="color:red">Nie można pobrać rezerwacji</p>`;
            isProcessing = false;
            return;
        }
    }

    try {
        // 3️⃣ TWORZENIE BILETU
        const bilet = await apiFetch('/bilety', {
            method: 'POST',
            body: JSON.stringify({
                rezerwacja_id: rezerwacja.id,
                imie_pasazera,
                nazwisko_pasazera,
                pesel_pasazera
            })
        });

        // 4️⃣ PRZEJŚCIE DO BLIK

        localStorage.setItem('blik_bilet_id', bilet.id);
        localStorage.setItem('blik_client_id', klient_id); // ✅ KLUCZOWE
        window.location.href = '/blik';

    } catch (e) {
        console.error(e);
        document.getElementById('sellResult').innerHTML =
            `<p style="color:red">Błąd tworzenia biletu</p>`;
    } finally {
        isProcessing = false;
    }
}

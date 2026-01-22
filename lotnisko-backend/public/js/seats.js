//const API_URL = 'http://127.0.0.1:8000/api';

document.addEventListener('DOMContentLoaded', () => {
    checkSession(['CLIENT']);
    initSeats();
    bindPassengerInputs();
});

let selectedSeatId = null;
let selectedSeatClass = null;
let cachedSeats = [];
let selectedLot = null;
let isProcessing = false;


const PRICE_BY_CLASS = {
    ECONOMY: 250,
    BUSINESS: 500,
    FIRST: 800
};


function formatLotDate(dateString, timeString) {
    if (!dateString) return '—';

    const d = new Date(dateString);
    return `${String(d.getDate()).padStart(2, '0')}.` +
           `${String(d.getMonth() + 1).padStart(2, '0')}.` +
           `${d.getFullYear()} ${timeString || ''}`.trim();
}


async function initSeats() {
    const stored = localStorage.getItem('selectedFlight');

    if (!stored) {
        alert('Brak wybranego lotu');
        window.location.href = '/client/dashboard';
        return;
    }

    selectedLot = JSON.parse(stored);
    updateSummaryLot();
    await loadSeatsForLot();
}


function updateSummaryLot() {
    document.getElementById('summaryLot').textContent =
        `${selectedLot.from} → ${selectedLot.to} (${formatLotDate(selectedLot.date, selectedLot.time)})`;
}


function bindPassengerInputs() {
    const map = [
        ['passengerFirstName', 'summaryPassengerFirstName'],
        ['passengerLastName', 'summaryPassengerLastName'],
        ['passengerPesel', 'summaryPassengerPesel']
    ];

    map.forEach(([inputId, summaryId]) => {
        const input = document.getElementById(inputId);
        const summary = document.getElementById(summaryId);

        if (input && summary) {
            input.addEventListener('input', () => {
                summary.textContent = input.value || '—';
            });
        }
    });
}


async function loadSeatsForLot() {
    const map = document.getElementById('seatMap');
    map.innerHTML = '';

    const miejsca = await apiFetch(`/loty/${selectedLot.id}/miejsca`);
    cachedSeats = miejsca;

    if (!Array.isArray(miejsca) || !miejsca.length) {
        map.innerHTML = '<p>Brak miejsc</p>';
        return;
    }

    const byClass = { FIRST: [], BUSINESS: [], ECONOMY: [] };
    miejsca.forEach(m => byClass[m.klasa.toUpperCase()]?.push(m));

    const createAisle = () => {
        const d = document.createElement('div');
        d.className = 'seat-aisle';
        return d;
    };

    const renderSection = (label, seats) => {
        if (!seats.length) return;

        const header = document.createElement('div');
        header.className = 'class-section';
        header.textContent = label;
        map.appendChild(header);

        const rows = {};
        seats.forEach(m => {
            const row = m.numer.match(/\d+/)?.[0];
            (rows[row] ??= []).push(m);
        });

        Object.keys(rows)
        .sort((a, b) => Number(a) - Number(b))
        .forEach(row => {
            const rowLabel = document.createElement('div');
            rowLabel.className = 'row-label';
            rowLabel.textContent = row;
            map.appendChild(rowLabel);

            rows[row].forEach((m, i) => {
                const seat = document.createElement('div');
                seat.className = `seat ${m.klasa.toLowerCase()} ${m.zajete ? 'taken' : ''}`;
                seat.textContent = m.numer.slice(-1);

                if (!m.zajete) {
                    seat.onclick = () => selectSeat(m.id, m.klasa, m.numer, seat);
                }

                map.appendChild(seat);
                if (i === 2) map.appendChild(createAisle());
            });
        });
    };

    renderSection('FIRST CLASS', byClass.FIRST);
    renderSection('BUSINESS CLASS', byClass.BUSINESS);
    renderSection('ECONOMY CLASS', byClass.ECONOMY);
}


function selectSeat(seatId, seatClass, seatNumber, el) {
    document.querySelectorAll('.seat.selected')
        .forEach(s => s.classList.remove('selected'));

    el.classList.add('selected');

    selectedSeatId = seatId;
    selectedSeatClass = seatClass;

    document.getElementById('summarySeat').textContent = seatNumber;
    document.getElementById('summaryClass').textContent = seatClass;

    let cena =
        selectedLot.ceny?.find(c => c.klasa.toUpperCase() === seatClass.toUpperCase())?.cena
        ?? PRICE_BY_CLASS[seatClass.toUpperCase()];

    document.getElementById('summaryPrice').textContent = cena;
    document.getElementById('reserveBtn').disabled = false;
}


async function reserveSeat() {
    if (isProcessing) return;
    isProcessing = true;

    const user = getUser();
    const klient_id = user?.id;
    const miejsce_id = selectedSeatId;

    const cena = summaryPrice.textContent.trim();

    if (!klient_id || !miejsce_id) {
        alert('Wybierz miejsce');
        isProcessing = false;
        return;
    }

   
    localStorage.setItem('passengerFirstName', passengerFirstName.value.trim());
    localStorage.setItem('passengerLastName', passengerLastName.value.trim());
    localStorage.setItem('passengerPesel', passengerPesel.value.trim());

    try {
        const rezerwacja = await apiFetch('/rezerwacje', {
            method: 'POST',
            body: JSON.stringify({
                klient_id,
                miejsce_id
            })
        });

        localStorage.setItem('rezerwacja_id', rezerwacja.id);
        localStorage.setItem('blik_rezerwacja_id', rezerwacja.id);
        localStorage.setItem('blik_kwota', cena);

        window.location.href = '/client/blik-client';

    } catch (e) {
        console.error(e);
        alert('Błąd rezerwacji');
        isProcessing = false;
    }
}

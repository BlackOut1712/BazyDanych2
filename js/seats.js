const API_URL = 'http://127.0.0.1:8000/api';

checkSession('KLIENT');

const flight = JSON.parse(localStorage.getItem('selectedFlight'));
if (!flight) {
    alert('Brak wybranego lotu');
    window.location.href = '../index.html';
}

const plane = document.getElementById('plane');
const selectedSeatEl = document.getElementById('selectedSeat');
const reserveBtn = document.getElementById('reserveBtn');

let selectedSeatId = null;

/* INFO O LOCIE */
document.getElementById('flightInfo').innerHTML = `
    <p><strong>Trasa:</strong> ${flight.from} → ${flight.to}</p>
    <p><strong>Data:</strong> ${flight.date}</p>
    <p><strong>Godzina:</strong> ${flight.time}</p>
`;

/* POBIERANIE MIEJSC */
fetch(`${API_URL}/loty/${flight.id}/miejsca`)
    .then(res => res.json())
    .then(renderSeats)
    .catch(err => console.error(err));

function renderSeats(miejsca) {
    plane.innerHTML = '';

    miejsca.forEach(m => {
        const seat = document.createElement('div');
        seat.classList.add('seat');

        if (m.zajete) {
            seat.classList.add('taken');
        } else {
            seat.classList.add('free');
            seat.onclick = () => selectSeat(seat, m);
        }

        seat.textContent = m.numer;
        plane.appendChild(seat);
    });
}


function selectSeat(el, miejsce) {
    document.querySelectorAll('.seat.selected')
        .forEach(s => s.classList.remove('selected'));

    el.classList.add('selected');
    selectedSeatId = miejsce.id;
    selectedSeatEl.textContent = miejsce.numer;
    reserveBtn.disabled = false;
}

/* REZERWACJA */
reserveBtn.onclick = () => {
    const klient_id = localStorage.getItem('user_id');

    fetch(`${API_URL}/rezerwacje`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            klient_id,
            lot_id: flight.id,
            miejsce_id: selectedSeatId
        })
    })
    .then(res => {
        if (!res.ok) throw new Error('Błąd rezerwacji');
        return res.json();
    })
    .then(() => {
        alert('Rezerwacja utworzona');
        window.location.href = '../summary.html';
    })
    .catch(err => alert(err.message));
};

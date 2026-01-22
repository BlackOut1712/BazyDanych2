document.addEventListener('DOMContentLoaded', () => {
    checkSession(['KASJER']);

    const biletId = localStorage.getItem('changeSeatBiletId');

    if (!biletId) {
        alert('Brak wybranego biletu');
        window.location.href = '/cashier/dashboard';
        return;
    }

    loadTicket(biletId);
});



let selectedSeatId = null;
let selectedSeatClass = null;

let currentSeatId = null;
let currentSeatClass = null;

let currentReservationId = null;
let currentLotId = null;


async function loadTicket(biletId) {
    try {
        const bilet = await apiFetch(`/bilety/${biletId}`);

        if (!bilet || !bilet.rezerwacja || !bilet.rezerwacja.miejsce) {
            throw new Error('Niekompletne dane biletu');
        }

        if (bilet.status !== 'OPLACONY') {
            alert('Nie można zmieniać miejsca dla nieopłaconego biletu');
            localStorage.removeItem('changeSeatBiletId');
            window.location.href = '/cashier/menagment';
            return;
        }

        const miejsce = bilet.rezerwacja.miejsce;

        currentSeatId = miejsce.id;
        currentSeatClass = String(miejsce.klasa).toUpperCase();
        currentReservationId = bilet.rezerwacja.id;
        currentLotId = miejsce.lot_id;

        renderTicketInfo(bilet);

        await loadSeatsForLot(currentLotId, currentSeatId);

    } catch (e) {
        console.error(e);
        alert('Błąd ładowania biletu');
        window.location.href = '/cashier/menagment';
    }
}

function renderTicketInfo(b) {
    const info = document.getElementById('ticketInfo');
    const trasa = b.rezerwacja.miejsce.lot.trasa;

    info.innerHTML = `
        <p><b>Pasażer:</b> ${b.imie_pasazera} ${b.nazwisko_pasazera}</p>
        <p><b>Lot:</b>
            ${trasa.lotnisko_wylotu.miasto}
            →
            ${trasa.lotnisko_przylotu.miasto}
        </p>
        <p><b>Klasa biletu:</b> ${currentSeatClass}</p>
        <p><b>Obecne miejsce:</b> ${b.rezerwacja.miejsce.numer_miejsca}</p>
    `;
}



async function loadSeatsForLot(lotId, currentSeatId) {
    const map = document.getElementById('seatMap');
    map.innerHTML = '';

    const miejsca = await apiFetch(`/loty/${lotId}/miejsca`);

    if (!Array.isArray(miejsca) || !miejsca.length) {
        map.innerHTML = '<p>Brak miejsc</p>';
        return;
    }

    const byClass = { FIRST: [], BUSINESS: [], ECONOMY: [] };
    miejsca.forEach(m => byClass[String(m.klasa).toUpperCase()]?.push(m));

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

        Object.keys(rows).sort((a, b) => a - b).forEach(row => {
            const rowLabel = document.createElement('div');
            rowLabel.className = 'row-label';
            rowLabel.textContent = row;
            map.appendChild(rowLabel);

            rows[row]
                .sort((a, b) => a.numer.localeCompare(b.numer))
                .forEach((m, index) => {
                    const seatClass = String(m.klasa).toUpperCase();

                    const seat = document.createElement('div');
                    seat.className = `seat ${seatClass.toLowerCase()}`;

                    
                    if (seatClass !== currentSeatClass) {
                        seat.classList.add('blocked');
                        seat.title = 'Nie można zmienić klasy miejsca';
                        map.appendChild(seat);
                        if (index === 2) map.appendChild(createAisle());
                        return;
                    }

                    if (m.zajete && m.id !== currentSeatId) {
                        seat.classList.add('taken');
                    }

                    seat.textContent = m.numer.slice(-1);

                    if (m.id === currentSeatId) {
                        seat.classList.add('selected');
                        selectedSeatId = m.id;
                        selectedSeatClass = seatClass;
                    }

                    if (!m.zajete || m.id === currentSeatId) {
                        seat.onclick = () => selectSeat(m.id, seatClass, seat);
                    }

                    map.appendChild(seat);
                    if (index === 2) map.appendChild(createAisle());
                });
        });
    };

    renderSection('FIRST CLASS', byClass.FIRST);
    renderSection('BUSINESS CLASS', byClass.BUSINESS);
    renderSection('ECONOMY CLASS', byClass.ECONOMY);
}



function selectSeat(seatId, seatClass, el) {
    if (seatClass !== currentSeatClass) {
        alert('Nie można zmienić klasy biletu');
        return;
    }

    document.querySelectorAll('.seat.selected')
        .forEach(s => s.classList.remove('selected'));

    el.classList.add('selected');
    selectedSeatId = seatId;
    selectedSeatClass = seatClass;
}



async function confirmSeatChange() {
    if (!selectedSeatId) {
        alert('Wybierz nowe miejsce');
        return;
    }

    if (selectedSeatId === currentSeatId) {
        alert('Wybrano to samo miejsce');
        return;
    }

    if (selectedSeatClass !== currentSeatClass) {
        alert('Nie można zmienić klasy miejsca');
        return;
    }

    try {
        await apiFetch(`/rezerwacje/zmien-miejsce`, {
            method: 'POST',
            body: JSON.stringify({
                rezerwacja_id: currentReservationId,
                nowe_miejsce_id: selectedSeatId
            })
        });

        alert(' Miejsce zostało zmienione');
        localStorage.removeItem('changeSeatBiletId');
        window.location.href = '/cashier/menagment';

    } catch (e) {
        console.error(e);
        alert(' Błąd zmiany miejsca');
    }
}

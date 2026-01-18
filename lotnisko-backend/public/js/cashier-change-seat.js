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

/* ============================
   DANE BILETU
============================ */

let selectedSeatId = null;
let currentSeatId = null;
let currentReservationId = null;
let currentLotId = null;

async function loadTicket(biletId) {
    try {
        const bilet = await apiFetch(`/bilety/${biletId}`);

        if (!bilet || !bilet.rezerwacja || !bilet.rezerwacja.miejsce) {
            throw new Error('Niekompletne dane biletu');
        }

        currentSeatId = bilet.rezerwacja.miejsce.id;
        currentReservationId = bilet.rezerwacja.id;
        currentLotId = bilet.rezerwacja.miejsce.lot_id;

        renderTicketInfo(bilet);

        // 🔥 KLUCZOWE: ładujemy mapę dokładnie jak w SELL
        loadSeatsForLot(currentLotId, currentSeatId);

    } catch (e) {
        console.error(e);
        alert('Błąd ładowania biletu');
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
        <p><b>Obecne miejsce:</b> ${b.rezerwacja.miejsce.numer_miejsca}</p>
    `;
}

/* ============================
   MAPA MIEJSC – IDENTYCZNA JAK SELL
============================ */

async function loadSeatsForLot(lotId, currentSeatId) {
    const map = document.getElementById('seatMap');
    map.innerHTML = '';

    const miejsca = await apiFetch(`/loty/${lotId}/miejsca`);
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
                seat.className = `seat ${m.klasa.toLowerCase()}`;

                // zajęte ALE obecne miejsce → nadal klikalne
                if (m.zajete && m.id !== currentSeatId) {
                    seat.classList.add('taken');
                }

                seat.textContent = m.numer.slice(-1);

                // zaznaczenie aktualnego miejsca
                if (m.id === currentSeatId) {
                    seat.classList.add('selected');
                    selectedSeatId = m.id;
                }

                if (!m.zajete || m.id === currentSeatId) {
                    seat.onclick = () => selectSeat(m.id, seat);
                }

                map.appendChild(seat);

                // 🔥 korytarz po C
                if (index === 2) {
                    map.appendChild(createAisle());
                }
            });
        });
    };

    renderSection('FIRST CLASS', byClass.FIRST);
    renderSection('BUSINESS CLASS', byClass.BUSINESS);
    renderSection('ECONOMY CLASS', byClass.ECONOMY);
}

/* ============================
   WYBÓR MIEJSCA
============================ */

function selectSeat(seatId, el) {
    document.querySelectorAll('.seat.selected')
        .forEach(s => s.classList.remove('selected'));

    el.classList.add('selected');
    selectedSeatId = seatId;
}

/* ============================
   ZAPIS ZMIANY
============================ */

async function confirmSeatChange() {
    if (!selectedSeatId) {
        alert('Wybierz nowe miejsce');
        return;
    }

    if (selectedSeatId === currentSeatId) {
        alert('Wybrano to samo miejsce');
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

        alert('✔ Miejsce zostało zmienione');
        localStorage.removeItem('changeSeatBiletId');
        window.location.href = '/cashier/menagment';

    } catch (e) {
        console.error(e);
        alert('❌ Błąd zmiany miejsca');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    checkSession(['KASJER', 'MENADZER']);
    initSell();
});

let isProcessing = false;

/* ======================================================
   INIT
====================================================== */
async function initSell() {
    await loadKlients();
    await loadLots();

    document
        .getElementById('lotSelect')
        .addEventListener('change', loadSeatsForLot);
}

/* ======================================================
   DANE PODSTAWOWE
====================================================== */

async function loadKlients() {
    const select = document.getElementById('klientSelect');
    select.innerHTML = `<option value="">Ładowanie klientów...</option>`;

    try {
        const klients = await apiFetch('/klienci');

        select.innerHTML = `<option value="">-- wybierz klienta --</option>`;
        klients.forEach(k => {
            select.innerHTML += `
                <option value="${k.id}">
                    ${k.imie} ${k.nazwisko} (${k.pesel})
                </option>
            `;
        });
    } catch (e) {
        console.error(e);
        select.innerHTML = `<option value="">Błąd ładowania klientów</option>`;
    }
}

async function loadLots() {
    const select = document.getElementById('lotSelect');
    select.innerHTML = `<option value="">Ładowanie lotów...</option>`;

    try {
        const lots = await apiFetch('/loty');

        select.innerHTML = `<option value="">-- wybierz lot --</option>`;
        lots.forEach(l => {
            select.innerHTML += `
                <option value="${l.id}">
                    ${l.trasa.lotnisko_wylotu.miasto}
                    →
                    ${l.trasa.lotnisko_przylotu.miasto}
                </option>
            `;
        });
    } catch (e) {
        console.error(e);
        select.innerHTML = `<option value="">Błąd ładowania lotów</option>`;
    }
}

/* ======================================================
   MIEJSCA – ZALEŻNE OD MODELU I ZAJĘTOŚCI
====================================================== */

async function loadSeatsForLot() {
    const lotId = this.value;
    const select = document.getElementById('miejsceSelect');

    select.disabled = true;
    select.innerHTML = `<option value="">Ładowanie miejsc...</option>`;

    if (!lotId) {
        select.innerHTML = `<option value="">-- wybierz miejsce --</option>`;
        return;
    }

    try {
        const miejsca = await apiFetch(`/loty/${lotId}/miejsca`);

        if (miejsca.length === 0) {
            select.innerHTML = `<option value="">Brak dostępnych miejsc</option>`;
            return;
        }

        select.innerHTML = `<option value="">-- wybierz miejsce --</option>`;
        miejsca.forEach(m => {
            select.innerHTML += `
                <option value="${m.id}">
                    ${m.numer}
                </option>
            `;
        });

        select.disabled = false;
    } catch (e) {
        console.error(e);
        select.innerHTML = `<option value="">Błąd ładowania miejsc</option>`;
    }
}

/* ======================================================
   SPRZEDAŻ = REZERWACJA + BILET + PŁATNOŚĆ
====================================================== */

async function sellTicket() {
    if (isProcessing) return;
    isProcessing = true;

    const klient_id = document.getElementById('klientSelect').value;
    const lot_id = document.getElementById('lotSelect').value;
    const miejsce_id = document.getElementById('miejsceSelect').value;
    const cena = document.getElementById('priceInput').value;
    const result = document.getElementById('sellResult');

    if (!klient_id || !lot_id || !miejsce_id || !cena || cena <= 0) {
        result.innerHTML = `
            <p style="color:red">
                Uzupełnij wszystkie pola i podaj poprawną cenę
            </p>
        `;
        isProcessing = false;
        return;
    }

    try {
        result.innerHTML = `<p>⏳ Przetwarzanie sprzedaży...</p>`;

        /* REZERWACJA */
        const rezerwacja = await apiFetch('/rezerwacje', {
            method: 'POST',
            body: JSON.stringify({
                klient_id,
                lot_id,
                miejsce_id,
                pracownik_id: getCurrentUserId()
            })
        });

        /* BILET */
        const bilet = await apiFetch('/bilety', {
            method: 'POST',
            body: JSON.stringify({
                rezerwacja_id: rezerwacja.id,
                lot_id,
                miejsce_id
            })
        });

        /* PŁATNOŚĆ */
        await apiFetch('/platnosci', {
            method: 'POST',
            body: JSON.stringify({
                kwota: parseInt(cena),
                metoda: 'GOTOWKA',
                klient_id,
                bilet_id: bilet.id
            })
        });

        result.innerHTML = `
            <p style="color:green">
                Bilet sprzedany poprawnie<br>
                Numer biletu: <b>${bilet.id}</b>
            </p>
        `;

        setTimeout(() => goBack(), 2000);

    } catch (e) {
        console.error(e);
        result.innerHTML = `
            <p style="color:red">
                Wystąpił błąd podczas sprzedaży
            </p>
        `;
        isProcessing = false;
    }
}

/* ======================================================
   POWRÓT
====================================================== */

function goBack() {
    window.location.href = 'dashboard.html';
}

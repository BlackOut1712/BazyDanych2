document.addEventListener('DOMContentLoaded', async () => {
    // 🔐 TYLKO MENADŻER
    checkSession(['MENADZER']);

    const body = document.getElementById('workersBody');

    // jeśli nie jesteśmy na workers.html – kończymy
    if (!body) return;

    // 🛡️ zabezpieczenie – apiFetch musi istnieć
    if (typeof apiFetch !== 'function') {
        body.innerHTML = `
            <tr>
                <td colspan="4">Brak połączenia z API</td>
            </tr>
        `;
        return;
    }

    try {
        const workers = await apiFetch('/pracownicy');

        body.innerHTML = '';

        if (!workers.length) {
            body.innerHTML = `
                <tr>
                    <td colspan="4">Brak pracowników</td>
                </tr>
            `;
            return;
        }

        workers.forEach(w => {
            const tr = document.createElement('tr');

            tr.innerHTML = `
                <td>${w.imie}</td>
                <td>${w.nazwisko}</td>
                <td>${w.login}</td>
                <td>${w.rola}</td>
            `;

            body.appendChild(tr);
        });

    } catch (e) {
        console.error(e);
        body.innerHTML = `
            <tr>
                <td colspan="4">Błąd pobierania pracowników</td>
            </tr>
        `;
    }
});

/* ======================================================
   NAWIGACJA – DASHBOARD
====================================================== */

function goToWorkers() {
    window.location.href = 'workers.html';
}

function goToFlights() {
    window.location.href = 'flights.html';
}

function goToPlanes() {
    window.location.href = 'planes.html';
}

function goToStats() {
    window.location.href = 'stats.html';
}

/* ======================================================
   DODAWANIE PRACOWNIKA
====================================================== */

async function addWorker() {
    const result = document.getElementById('addResult');

    const data = {
        imie: imie.value.trim(),
        nazwisko: nazwisko.value.trim(),
        pesel: pesel.value.trim(),
        adres: adres.value.trim(),
        telefon: telefon.value.trim(),
        email: email.value.trim(),
        login: login.value.trim(),
        haslo: haslo.value,
        data_zatrudnienia: new Date().toISOString().slice(0, 10),
        rola: rola.value
    };

    try {
        await apiFetch('/pracownicy', {
            method: 'POST',
            body: JSON.stringify(data)
        });

        result.innerHTML = '<p style="color:green">Pracownik dodany</p>';

        setTimeout(() => location.reload(), 800);

    } catch (e) {
        console.error(e);
        result.innerHTML = '<p style="color:red">Błąd dodawania pracownika</p>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    checkSession(['MENADZER']);
    loadWorkers();
});

/* ======================================================
   LISTA PRACOWNIKÓW
====================================================== */

async function loadWorkers() {
    const body = document.getElementById('workersBody');
    body.innerHTML = `<tr><td colspan="6">Ładowanie…</td></tr>`;

    try {
        const workers = await apiFetch('/pracownicy');
        body.innerHTML = '';

        if (!workers.length) {
            body.innerHTML = `<tr><td colspan="6">Brak pracowników</td></tr>`;
            return;
        }

        workers.forEach(w => {
            const tr = document.createElement('tr');

            tr.innerHTML = `
                <td>${w.imie}</td>
                <td>${w.nazwisko}</td>
                <td><code>${w.login}</code></td>
                <td>
                    <span class="role-badge role-${w.rola}">
                        ${w.rola === 'MENADZER' ? 'Menadżer' : 'Kasjer'}
                    </span>
                </td>
                <td>
                    <span class="role-badge ${w.status ? 'role-MENADZER' : 'role-KASJER'}">
                        ${w.status ? 'Aktywny' : 'Zablokowany'}
                    </span>
                </td>
                <td class="actions">
                    <button class="icon-btn" onclick="editWorker(${w.id})">✏️</button>
                    <button class="icon-btn danger" onclick="toggleWorker(${w.id})">
                        ${w.status ? '🔒' : '🔓'}
                    </button>
                </td>
            `;

            body.appendChild(tr);
        });

    } catch (e) {
        console.error(e);
        body.innerHTML = `<tr><td colspan="6">Błąd pobierania danych</td></tr>`;
    }
}

/* ======================================================
   BLOKADA / ODBLOKOWANIE
====================================================== */

async function toggleWorker(id) {
    if (!confirm('Czy na pewno zmienić status pracownika?')) return;

    try {
        await apiFetch(`/pracownicy/${id}/status`, {
            method: 'PUT'
        });

        loadWorkers();

    } catch (e) {
        console.error(e);
        alert('Błąd zmiany statusu pracownika');
    }
}

/* ======================================================
   EDYCJA
====================================================== */

async function editWorker(id) {
    try {
        const workers = await apiFetch('/pracownicy');
        const w = workers.find(p => p.id === id);
        if (!w) return;

        document.getElementById('formTitle').innerText = 'Edytuj pracownika';
        document.getElementById('imie').value = w.imie;
        document.getElementById('nazwisko').value = w.nazwisko;
        document.getElementById('pesel').value = w.pesel;
        document.getElementById('adres').value = w.adres;
        document.getElementById('telefon').value = w.telefon;
        document.getElementById('email').value = w.email;
        document.getElementById('login').value = w.login;
        document.getElementById('rola').value = w.rola;
        document.getElementById('aktywny').value = w.status ? '1' : '0';
        document.getElementById('haslo').value = '';

        document.getElementById('workerId').value = w.id;

        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });

    } catch (e) {
        console.error(e);
        alert('Błąd wczytywania danych pracownika');
    }
}

/* ======================================================
   ZAPIS (DODAJ / EDYTUJ)
====================================================== */

async function saveWorker() {
    const id = document.getElementById('workerId')?.value || null;
    const result = document.getElementById('formResult');

    const data = {
        imie: imie.value.trim(),
        nazwisko: nazwisko.value.trim(),
        pesel: pesel.value.trim(),
        adres: adres.value.trim(),
        telefon: telefon.value.trim(),
        email: email.value.trim(),
        login: login.value.trim(),
        rola: rola.value,
        status: aktywny.value === '1',
    };

    if (haslo.value.trim()) {
        data.haslo = haslo.value;
    }

    try {
        if (id) {
            // ✏️ EDYCJA
            await apiFetch(`/pracownicy/${id}`, {
                method: 'PUT',
                body: JSON.stringify(data)
            });
        } else {
            // ➕ DODAWANIE
            data.haslo = haslo.value;
            await apiFetch('/pracownicy', {
                method: 'POST',
                body: JSON.stringify(data)
            });
        }

        result.innerHTML = `<p style="color:green">Zapisano poprawnie</p>`;
        resetForm();
        loadWorkers();

    } catch (e) {
        console.error(e);
        result.innerHTML = `<p style="color:red">Błąd zapisu</p>`;
    }
}

/* ======================================================
   RESET FORMULARZA
====================================================== */

function resetForm() {
    document.getElementById('formTitle').innerText = 'Dodaj pracownika';
    document.querySelectorAll('.form-grid input').forEach(i => i.value = '');
    document.getElementById('rola').value = 'KASJER';
    document.getElementById('aktywny').value = '1';
    document.getElementById('formResult').innerHTML = '';
    const idField = document.getElementById('workerId');
    if (idField) idField.value = '';
}

/* ======================================================
   POWRÓT
====================================================== */

function goBack() {
    window.location.href = 'dashboard.html';
}

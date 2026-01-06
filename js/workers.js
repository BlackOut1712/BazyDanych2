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
                    <button class="icon-btn danger" onclick="toggleWorker(${w.id})"
                        title="${w.status ? 'Zablokuj' : 'Odblokuj'}">
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
   BLOKADA / ODBLOKOWANIE (JEDYNE MIEJSCE ZMIANY STATUSU)
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
   EDYCJA (BEZ STATUSU)
====================================================== */

async function editWorker(id) {
    try {
        const workers = await apiFetch('/pracownicy');
        const w = workers.find(p => p.id === id);
        if (!w) return;

        document.getElementById('formTitle').innerText = 'Edytuj pracownika';

        imie.value = w.imie;
        nazwisko.value = w.nazwisko;
        pesel.value = w.pesel;
        adres.value = w.adres;
        telefon.value = w.telefon;
        email.value = w.email;
        login.value = w.login;
        rola.value = w.rola;
        haslo.value = '';

        // 🔒 PESEL tylko do podglądu
        pesel.disabled = true;

        let idField = document.getElementById('workerId');
        if (!idField) {
            idField = document.createElement('input');
            idField.type = 'hidden';
            idField.id = 'workerId';
            document.body.appendChild(idField);
        }
        idField.value = w.id;

        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });

    } catch (e) {
        console.error(e);
        alert('Błąd wczytywania danych pracownika');
    }
}

/* ======================================================
   ZAPIS (STATUSU TU NIE MA)
====================================================== */

async function saveWorker() {
    const id = document.getElementById('workerId')?.value || null;
    const result = document.getElementById('formResult');

    const data = {
        imie: imie.value.trim(),
        nazwisko: nazwisko.value.trim(),
        adres: adres.value.trim(),
        telefon: telefon.value.trim(),
        email: email.value.trim(),
        login: login.value.trim(),
        rola: rola.value
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
            // ➕ DODAWANIE (zawsze aktywny)
            if (!data.haslo) {
                alert('Hasło jest wymagane przy dodawaniu pracownika');
                return;
            }

            data.pesel = pesel.value.trim();

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
   RESET
====================================================== */

function resetForm() {
    document.getElementById('formTitle').innerText = 'Dodaj pracownika';
    document.querySelectorAll('.form-grid input').forEach(i => {
        i.value = '';
        i.disabled = false;
    });
    rola.value = 'KASJER';
    formResult.innerHTML = '';

    const idField = document.getElementById('workerId');
    if (idField) idField.value = '';
}

/* ======================================================
   POWRÓT
====================================================== */

function goBack() {
    window.location.href = 'dashboard.html';
}

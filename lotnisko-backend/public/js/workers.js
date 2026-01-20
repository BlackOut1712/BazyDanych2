document.addEventListener('DOMContentLoaded', () => {
    // Dostęp tylko MENADZER
    checkSession(['MENADZER']);
    loadWorkers();
    allowOnlyDigits('pesel', 11);
    allowOnlyDigits('telefon', 9);
});

// login głównego admina – NIETYKALNY
const PROTECTED_LOGIN = 'admin';
function isValidWorkerPassword(password) {
    if (!password) return true; // puste = bez zmiany

    const minLength = password.length >= 6;
    const hasUppercase = /[A-Z]/.test(password);
    const hasDigit = /\d/.test(password);

    return minLength && hasUppercase && hasDigit;
}
/* ============================
   LISTA PRACOWNIKÓW
============================ */
async function loadWorkers() {
    const body = document.getElementById('workersBody');
    if (!body) {
        console.error('Brak elementu #workersBody');
        return;
    }

    body.innerHTML = `<tr><td colspan="6">Ładowanie…</td></tr>`;

    try {
        const workers = await apiFetch('/pracownicy');
        body.innerHTML = '';

        if (!workers || workers.length === 0) {
            body.innerHTML = `<tr><td colspan="6">Brak pracowników</td></tr>`;
            return;
        }

        workers.forEach(w => {
            const isProtected = w.login === PROTECTED_LOGIN;
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
                    ${
                        isProtected
                            ? `<span style="opacity:.5">—</span>`
                            : `
                                <button class="icon-btn" onclick="editWorker(${w.id})">✏️</button>
                                <button class="icon-btn danger"
                                    onclick="toggleWorker(${w.id})"
                                    title="${w.status ? 'Zablokuj' : 'Odblokuj'}">
                                    ${w.status ? '🔒' : '🔓'}
                                </button>
                              `
                    }
                </td>
            `;

            body.appendChild(tr);
        });

    } catch (e) {
        console.error('Błąd pobierania pracowników:', e);
        body.innerHTML = `<tr><td colspan="6">Błąd pobierania danych</td></tr>`;
    }
}

/* ============================
   ZMIANA STATUSU
============================ */
async function toggleWorker(id) {
    const worker = await getWorkerById(id);
    if (!worker) return;

    if (worker.login === PROTECTED_LOGIN) {
        alert('Nie można zablokować głównego administratora');
        return;
    }

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

/* ============================
   EDYCJA PRACOWNIKA
============================ */
async function editWorker(id) {
    const w = await getWorkerById(id);
    if (!w) return;

    if (w.login === PROTECTED_LOGIN) {
        alert('Nie można edytować głównego administratora');
        return;
    }

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

    pesel.disabled = true;

    let idField = document.getElementById('workerId');
    if (!idField) {
        idField = document.createElement('input');
        idField.type = 'hidden';
        idField.id = 'workerId';
        document.body.appendChild(idField);
    }
    idField.value = w.id;

    window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
    });
}

/* ============================
   ZAPIS PRACOWNIKA
============================ */
async function saveWorker() {
    const id = document.getElementById('workerId')?.value || null;
    const result = document.getElementById('formResult');
    if (!result) return;

    const data = {
        imie: imie.value.trim(),
        nazwisko: nazwisko.value.trim(),
        adres: adres.value.trim(),
        telefon: telefon.value.trim(),
        email: email.value.trim(),
        login: login.value.trim(),
        rola: rola.value
    };

    const password = haslo.value.trim();

    if (password) {
        if (!isValidWorkerPassword(password)) {
            alert(
                'Hasło pracownika musi:\n' +
                '- mieć minimum 6 znaków\n' +
                '- zawierać co najmniej 1 dużą literę\n' +
                '- zawierać co najmniej 1 cyfrę'
            );
            return;
        }

        data.haslo = password;
    }


    try {
        if (id) {
            const worker = await getWorkerById(Number(id));
            if (worker?.login === PROTECTED_LOGIN) {
                alert('Nie można zapisać zmian głównego administratora');
                return;
            }

            await apiFetch(`/pracownicy/${id}`, {
                method: 'PUT',
                body: JSON.stringify(data)
            });
        } else {
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

        result.innerHTML = `<p style="color:green">✔ Zapisano poprawnie</p>`;
        resetForm();
        loadWorkers();

    } catch (e) {
        console.error(e);
        result.innerHTML = `<p style="color:red">Błąd zapisu</p>`;
    }
}

/* ============================
   POMOCNICZE
============================ */
async function getWorkerById(id) {
    try {
        const workers = await apiFetch('/pracownicy');
        return workers.find(w => w.id === id) || null;
    } catch {
        return null;
    }
}

/* ============================
   RESET FORMULARZA
============================ */
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

/* ============================
   POWRÓT
============================ */
function goBack() {
    window.location.href = '/admin/dashboard';
}
/* ============================
   🔒 WALIDACJA PESEL / TELEFON
============================ */

function allowOnlyDigits(id, maxLength) {
    const input = document.getElementById(id);
    if (!input) return;

    input.addEventListener('input', () => {
        input.value = input.value
            .replace(/\D/g, '')       // tylko cyfry
            .slice(0, maxLength);     // limit długości
    });
}



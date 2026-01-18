document.addEventListener('DOMContentLoaded', () => {
    // Dostęp tylko MENADZER
    checkSession(['MENADZER']);
    loadPlanes();
});

// POPRAWIONE – zgodne z HTML i generatorem (podzielne przez 6)
const DOZWOLONE_MIEJSCA = [90, 120, 150, 180];

/* ============================
   LISTA SAMOLOTÓW
============================ */
async function loadPlanes() {
    const body = document.getElementById('planesBody');
    if (!body) {
        console.error('Brak elementu #planesBody');
        return;
    }

    body.innerHTML = `<tr><td colspan="4">Ładowanie...</td></tr>`;

    try {
        const planes = await apiFetch('/samoloty');
        body.innerHTML = '';

        if (!planes || planes.length === 0) {
            body.innerHTML = `<tr><td colspan="4">Brak samolotów</td></tr>`;
            return;
        }

        planes.forEach(p => {
            const tr = document.createElement('tr');

            tr.innerHTML = `
                <td>${p.model}</td>
                <td>${p.liczba_miejsc}</td>
                <td>
                    <span class="role-badge ${p.status ? 'role-MENADZER' : 'role-KASJER'}">
                        ${p.status ? 'AKTYWNY' : 'NIEAKTYWNY'}
                    </span>
                </td>
                <td class="actions">
                    <button class="icon-btn"
                        title="Edytuj"
                        onclick="editPlane(${p.id})">✏️</button>
                    <button class="icon-btn danger"
                        title="Usuń"
                        onclick="deletePlane(${p.id}, '${p.model}')">🗑️</button>
                </td>
            `;

            body.appendChild(tr);
        });

    } catch (e) {
        console.error('Błąd pobierania samolotów:', e);
        body.innerHTML =
            `<tr><td colspan="4">Błąd pobierania danych</td></tr>`;
    }
}

/* ============================
   ZAPIS SAMOLOTU (ADD + EDIT)
============================ */
async function savePlane() {
    const id = document.getElementById('planeId').value;
    const model = document.getElementById('model').value.trim();
    const liczba = Number(document.getElementById('liczba_miejsc').value);
    const statusSelect = document.getElementById('status').value;
    const result = document.getElementById('planeResult');

    if (!model || !liczba) {
        result.innerHTML =
            '<p style="color:red">Uzupełnij wszystkie pola</p>';
        return;
    }

    if (!DOZWOLONE_MIEJSCA.includes(liczba)) {
        result.innerHTML =
            '<p style="color:red">Nieprawidłowa liczba miejsc</p>';
        return;
    }

    if (liczba % 6 !== 0) {
        result.innerHTML =
            '<p style="color:red">Liczba miejsc musi być podzielna przez 6</p>';
        return;
    }

    const payload = {
        model,
        liczba_miejsc: liczba,
        status: statusSelect === 'AKTYWNY'
    };

    try {
        if (id) {
            await apiFetch(`/samoloty/${id}`, {
                method: 'PUT',
                body: JSON.stringify(payload)
            });
        } else {
            await apiFetch('/samoloty', {
                method: 'POST',
                body: JSON.stringify(payload)
            });
        }

        hideAddPlaneForm();
        loadPlanes();

    } catch (e) {
        console.error('Błąd zapisu samolotu:', e);
        result.innerHTML =
            '<p style="color:red">Błąd zapisu</p>';
    }
}

/* ============================
   EDYCJA SAMOLOTU
============================ */
async function editPlane(id) {
    try {
        const planes = await apiFetch('/samoloty');
        const p = planes.find(x => x.id === id);
        if (!p) return;

        document.getElementById('planeFormTitle').innerText = 'Edytuj samolot';
        document.getElementById('planeId').value = p.id;
        document.getElementById('model').value = p.model;
        document.getElementById('liczba_miejsc').value = p.liczba_miejsc;
        document.getElementById('status').value =
            p.status ? 'AKTYWNY' : 'NIEAKTYWNY';

        document.getElementById('planeResult').innerHTML = '';
        document.getElementById('addPlaneSection').style.display = 'block';

        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: 'smooth'
        });

    } catch (e) {
        console.error('Błąd wczytywania danych samolotu:', e);
        alert('Błąd wczytywania danych samolotu');
    }
}

/* ============================
   DEZAKTYWACJA SAMOLOTU
============================ */
async function deletePlane(id, model) {
    const confirmDelete = confirm(
        `Czy na pewno chcesz dezaktywować samolot:\n\n${model}?`
    );
    if (!confirmDelete) return;

    try {
        await apiFetch(`/samoloty/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ status: false })
        });

        loadPlanes();
    } catch (e) {
        console.error('Błąd dezaktywacji samolotu:', e);
        alert('Nie udało się dezaktywować samolotu');
    }
}

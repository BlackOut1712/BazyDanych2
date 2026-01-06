document.addEventListener('DOMContentLoaded', () => {
    checkSession(['MENADZER']);
    loadPlanes();
});

/* ======================================================
   LISTA SAMOLOTÓW
====================================================== */

async function loadPlanes() {
    const body = document.getElementById('planesBody');
    body.innerHTML = `<tr><td colspan="4">Ładowanie...</td></tr>`;

    try {
        const planes = await apiFetch('/samoloty');
        body.innerHTML = '';

        if (!planes.length) {
            body.innerHTML = `<tr><td colspan="4">Brak samolotów</td></tr>`;
            return;
        }

        planes.forEach(p => {
            const tr = document.createElement('tr');

            tr.innerHTML = `
                <td>${p.model}</td>
                <td>${p.liczba_miejsc}</td>
                <td>
                    <span class="role-badge ${
                        p.status ? 'role-MENADZER' : 'role-KASJER'
                    }">
                        ${p.status ? 'AKTYWNY' : 'NIEAKTYWNY'}
                    </span>
                </td>
                <td class="actions">
                    <button class="icon-btn" onclick="editPlane(${p.id})">✏️</button>
                </td>
            `;

            body.appendChild(tr);
        });

    } catch (e) {
        console.error(e);
        body.innerHTML = `<tr><td colspan="4">Błąd pobierania danych</td></tr>`;
    }
}

/* ======================================================
   DODAWANIE / EDYCJA
====================================================== */

async function savePlane() {
    const id = document.getElementById('planeId').value;
    const model = document.getElementById('model').value.trim();
    const liczba = Number(document.getElementById('liczba_miejsc').value);
    const statusSelect = document.getElementById('status').value;
    const result = document.getElementById('planeResult');

    if (!model || !liczba || liczba < 1) {
        result.innerHTML = '<p style="color:red">Uzupełnij wszystkie pola</p>';
        return;
    }

    const payload = {
        model,
        liczba_miejsc: liczba,
        status: statusSelect === 'AKTYWNY'
    };

    try {
        if (id) {
            // ✏️ EDYCJA
            await apiFetch(`/samoloty/${id}`, {
                method: 'PUT',
                body: JSON.stringify(payload)
            });
        } else {
            // ➕ DODAWANIE
            await apiFetch('/samoloty', {
                method: 'POST',
                body: JSON.stringify(payload)
            });
        }

        result.innerHTML = '<p style="color:green">Zapisano poprawnie</p>';
        hideAddPlaneForm();
        loadPlanes();

    } catch (e) {
        console.error(e);
        result.innerHTML = '<p style="color:red">Błąd zapisu</p>';
    }
}

/* ======================================================
   EDYCJA
====================================================== */

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
        console.error(e);
        alert('Błąd wczytywania danych samolotu');
    }
}

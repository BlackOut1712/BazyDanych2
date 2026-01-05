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
            const status =
                localStorage.getItem(`plane_status_${p.id}`) || 'AKTYWNY';

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${p.model}</td>
                <td>${p.liczba_miejsc}</td>
                <td>
                    <span class="role-badge ${
                        status === 'AKTYWNY' ? 'role-MENADZER' : 'role-KASJER'
                    }">
                        ${status}
                    </span>
                </td>
                <td class="actions">
                    <button class="icon-btn" onclick="editPlane(${p.id})">✏️</button>
                </td>
            `;
            body.appendChild(tr);
        });

    } catch {
        body.innerHTML = `<tr><td colspan="4">Błąd pobierania danych</td></tr>`;
    }
}

/* ======================================================
   DODAWANIE / EDYCJA
====================================================== */

async function savePlane() {
    const id = document.getElementById('planeId').value;
    const model = document.getElementById('model').value.trim();
    const liczba = document.getElementById('liczba_miejsc').value;
    const status = document.getElementById('status').value;
    const result = document.getElementById('planeResult');

    if (!model || !liczba) {
        result.innerHTML = '<p style="color:red">Uzupełnij wszystkie pola</p>';
        return;
    }

    try {
        if (id) {
            // EDYCJA
            await apiFetch(`/samoloty/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ model, liczba_miejsc: liczba })
            });
        } else {
            // DODAWANIE
            const newPlane = await apiFetch('/samoloty', {
                method: 'POST',
                body: JSON.stringify({ model, liczba_miejsc: liczba })
            });

            localStorage.setItem(`plane_status_${newPlane.id}`, status);
        }

        if (id) {
            localStorage.setItem(`plane_status_${id}`, status);
        }

        result.innerHTML = '<p style="color:green">Zapisano</p>';
        hideAddPlaneForm();
        loadPlanes();

    } catch {
        result.innerHTML = '<p style="color:red">Błąd zapisu</p>';
    }
}

/* ======================================================
   EDYCJA
====================================================== */

function editPlane(id) {
    const rows = document.querySelectorAll('#planesBody tr');

    rows.forEach(tr => {
        const btn = tr.querySelector('.icon-btn');
        if (!btn) return;

        if (!btn.getAttribute('onclick').includes(id)) return;

        document.getElementById('planeFormTitle').innerText = 'Edytuj samolot';
        document.getElementById('planeId').value = id;
        document.getElementById('model').value = tr.children[0].innerText;
        document.getElementById('liczba_miejsc').value = tr.children[1].innerText;

        document.getElementById('status').value =
            localStorage.getItem(`plane_status_${id}`) || 'AKTYWNY';

        document.getElementById('planeResult').innerHTML = '';
        document.getElementById('addPlaneSection').style.display = 'block';
    });
}

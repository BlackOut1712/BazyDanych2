document.addEventListener('DOMContentLoaded', loadPlanes);

async function loadPlanes() {
    const body = document.getElementById('planesBody');
    body.innerHTML = '<tr><td colspan="5">Ładowanie…</td></tr>';

    try {
        // 🔌 API – dopasuj endpoint do backendu
        const planes = await apiFetch('/samoloty');

        body.innerHTML = '';

        if (!planes.length) {
            body.innerHTML = '<tr><td colspan="5">Brak samolotów</td></tr>';
            return;
        }

        planes.forEach(p => {
            const tr = document.createElement('tr');

            tr.innerHTML = `
                <td>${p.model}</td>
                <td>${p.liczba_miejsc}</td>
                <td>${p.typ || '-'}</td>
                <td>
                    <span class="status ${p.aktywny ? 'status-ok' : 'status-bad'}">
                        ${p.aktywny ? 'aktywny' : 'nieaktywny'}
                    </span>
                </td>
                <td class="actions">
                    <button class="icon-btn" onclick="editPlane(${p.id})">✏</button>
                    <button class="icon-btn danger" onclick="deletePlane(${p.id})">🗑</button>
                </td>
            `;

            body.appendChild(tr);
        });

    } catch (e) {
        console.error(e);
        body.innerHTML = '<tr><td colspan="5">Błąd pobierania danych</td></tr>';
    }
}

function openAddPlane() {
    alert('Formularz dodawania samolotu – do zrobienia');
}

function editPlane(id) {
    alert('Edycja samolotu ID: ' + id);
}

async function deletePlane(id) {
    if (!confirm('Czy na pewno usunąć samolot?')) return;

    try {
        await apiFetch(`/samoloty/${id}`, { method: 'DELETE' });
        loadPlanes();
    } catch (e) {
        alert('Błąd usuwania samolotu');
    }
}

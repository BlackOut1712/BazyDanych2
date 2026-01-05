document.addEventListener('DOMContentLoaded', loadFlights);

async function loadFlights() {
    const body = document.getElementById('flightsBody');
    body.innerHTML = '<tr><td colspan="6">Ładowanie…</td></tr>';

    try {
        // 🔌 endpoint dopasuj do backendu
        const flights = await apiFetch('/loty');

        body.innerHTML = '';

        if (!flights.length) {
            body.innerHTML = '<tr><td colspan="6">Brak lotów</td></tr>';
            return;
        }

        flights.forEach(f => {
            const tr = document.createElement('tr');

            const from = f.trasa?.lotnisko_wylotu?.miasto ?? '?';
            const to   = f.trasa?.lotnisko_przylotu?.miasto ?? '?';

            tr.innerHTML = `
                <td>${from} → ${to}</td>
                <td>${f.data}</td>
                <td>${f.godzina}</td>
                <td>${f.samolot?.model ?? '-'}</td>
                <td>
                    <span class="status ${f.aktywny ? 'status-ok' : 'status-bad'}">
                        ${f.aktywny ? 'aktywny' : 'nieaktywny'}
                    </span>
                </td>
                <td class="actions">
                    <button class="icon-btn" onclick="editFlight(${f.id})">✏</button>
                    <button class="icon-btn danger" onclick="deleteFlight(${f.id})">🗑</button>
                </td>
            `;

            body.appendChild(tr);
        });

    } catch (err) {
        console.error(err);
        body.innerHTML = '<tr><td colspan="6">Błąd pobierania lotów</td></tr>';
    }
}

function openAddFlight() {
    alert('Formularz dodawania lotu – następny krok');
}

function editFlight(id) {
    alert('Edycja lotu ID: ' + id);
}

async function deleteFlight(id) {
    if (!confirm('Czy na pewn

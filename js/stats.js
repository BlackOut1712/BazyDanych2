document.addEventListener('DOMContentLoaded', loadStats);

async function loadStats() {
    try {
        // 🔌 endpointy – możesz je potem zoptymalizować do jednego
        const [loty, rezerwacje, bilety, platnosci] = await Promise.all([
            apiFetch('/loty'),
            apiFetch('/rezerwacje'),
            apiFetch('/bilety'),
            apiFetch('/platnosci')
        ]);

        // 📊 kafelki
        document.getElementById('statFlights').textContent = loty.length;
        document.getElementById('statReservations').textContent = rezerwacje.length;
        document.getElementById('statTickets').textContent =
            bilety.filter(b => b.status === 'OPLACONY').length;

        const revenue = platnosci.reduce((sum, p) => sum + Number(p.kwota), 0);
        document.getElementById('statRevenue').textContent =
            revenue.toLocaleString('pl-PL') + ' zł';

        // ⭐ popularne loty
        renderPopularFlights(bilety);

    } catch (err) {
        console.error(err);
        alert('Błąd pobierania statystyk');
    }
}

function renderPopularFlights(bilety) {
    const body = document.getElementById('popularFlightsBody');
    body.innerHTML = '';

    const counter = {};

    bilety.forEach(b => {
        const from = b.rezerwacja?.lot?.trasa?.lotnisko_wylotu?.miasto;
        const to   = b.rezerwacja?.lot?.trasa?.lotnisko_przylotu?.miasto;

        if (!from || !to) return;

        const key = `${from} → ${to}`;
        counter[key] = (counter[key] || 0) + 1;
    });

    const sorted = Object.entries(counter)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    if (!sorted.length) {
        body.innerHTML = '<tr><td colspan="2">Brak danych</td></tr>';
        return;
    }

    sorted.forEach(([route, count]) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${route}</td>
            <td>${count}</td>
        `;
        body.appendChild(tr);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // 🔐 tylko MENADZER
    checkSession(['MENADZER']);
    loadStats();
});

/* ============================
   ŁADOWANIE STATYSTYK
============================ */
async function loadStats() {
    const periodSelect = document.getElementById('periodSelect');
    const period = periodSelect ? periodSelect.value : 'month';

    try {
        // 🔹 pobieramy wszystko równolegle (bez crasha)
        const results = await Promise.allSettled([
            apiFetch('/loty'),
            apiFetch('/rezerwacje'),
            apiFetch('/bilety'),
            apiFetch('/platnosci')
        ]);

        const loty        = results[0].status === 'fulfilled' ? results[0].value : [];
        const rezerwacje  = results[1].status === 'fulfilled' ? results[1].value : [];
        const bilety      = results[2].status === 'fulfilled' ? results[2].value : [];
        const platnosci   = results[3].status === 'fulfilled' ? results[3].value : [];

        const fromDate = getFromDate(period);

        const filteredFlights = loty.filter(l =>
            l.data && isAfter(l.data, fromDate)
        );

        const filteredReservations = rezerwacje.filter(r =>
            r.created_at && isAfter(r.created_at, fromDate)
        );

        const filteredTickets = bilety.filter(b =>
            // różne statusy z backendu
            ['OPLACONY', 'Opłacony', 'POTWIERDZONY'].includes(b.status) &&
            b.created_at &&
            isAfter(b.created_at, fromDate)
        );

        const filteredPayments = platnosci.filter(p =>
            p.created_at && isAfter(p.created_at, fromDate)
        );

        // 🔹 liczby
        setText('statFlights', filteredFlights.length);
        setText('statReservations', filteredReservations.length);
        setText('statTickets', filteredTickets.length);

        // 🔹 przychód
        const revenue = filteredPayments.reduce(
            (sum, p) => sum + Number(p.kwota || 0),
            0
        );

        setText(
            'statRevenue',
            revenue.toLocaleString('pl-PL') + ' zł'
        );

        renderPopularFlights(filteredTickets);

    } catch (e) {
        console.error('Błąd statystyk:', e);
        alert('Błąd pobierania statystyk');
    }
}

/* ============================
   NAJPOPULARNIEJSZE LOTY
============================ */
function renderPopularFlights(bilety) {
    const body = document.getElementById('popularFlightsBody');
    if (!body) return;

    body.innerHTML = '';

    const counter = {};

    bilety.forEach(b => {
        const from =
            b.rezerwacja?.lot?.trasa?.lotnisko_wylotu?.miasto;
        const to =
            b.rezerwacja?.lot?.trasa?.lotnisko_przylotu?.miasto;

        if (!from || !to) return;

        const key = `${from} → ${to}`;
        counter[key] = (counter[key] || 0) + 1;
    });

    const sorted = Object.entries(counter)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    if (!sorted.length) {
        body.innerHTML =
            `<tr><td colspan="2">Brak danych</td></tr>`;
        return;
    }

    sorted.forEach(([route, count]) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${route}</td><td>${count}</td>`;
        body.appendChild(tr);
    });
}

/* ============================
   OKRES CZASU
============================ */
function getFromDate(period) {
    const d = new Date();

    if (period === 'day') {
        d.setDate(d.getDate() - 1);
    }

    if (period === 'week') {
        d.setDate(d.getDate() - 7);
    }

    if (period === 'month') {
        d.setDate(d.getDate() - 30);
    }

    d.setHours(0, 0, 0, 0);
    return d;
}

function isAfter(dateString, fromDate) {
    return new Date(dateString) >= fromDate;
}

/* ============================
   POMOCNICZE
============================ */
function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

document.addEventListener('DOMContentLoaded', async () => {

    
    checkSession(['CLIENT']);
    
    const user = getUser();
    if (!user) {
        alert('Sesja wygasła');
        window.location.href = '/login';
        return;
    }

    const container = document.getElementById('tickets-container');
    if (!container) {
        console.error('Brak #tickets-container');
        return;
    }

    container.innerHTML = `
        <tr>
            <td colspan="5" class="table-loading">
                ⏳ Pobieranie biletów...
            </td>
        </tr>
    `;

    try {
        const data = await apiFetch('/moje-bilety');
        container.innerHTML = '';

        if (!Array.isArray(data) || data.length === 0) {
            container.innerHTML = `
                <tr>
                    <td colspan="5">Brak biletów.</td>
                </tr>
            `;
            return;
        }


        const today = new Date();
        const todayStr = today.toISOString().slice(0, 10); 

        const statusyAktywne = ['OPLACONY', 'POTWIERDZONA', 'NOWY'];


        const bilety = data.filter(b => {

            if (!statusyAktywne.includes(b.status)) {
                return false;
            }

            const lotData = b?.rezerwacja?.miejsce?.lot?.data;
            if (!lotData) return false;

            return lotData >= todayStr;
        });

        if (!bilety.length) {
            container.innerHTML = `
                <tr>
                    <td colspan="5">Brak aktualnych biletów.</td>
                </tr>
            `;
            return;
        }

        bilety.forEach(b => {

            const rezerwacja = b.rezerwacja ?? null;
            const miejsce = rezerwacja?.miejsce ?? null;
            const lot = miejsce?.lot ?? null;
            const trasa = lot?.trasa ?? null;

            const wylot = trasa?.lotnisko_wylotu?.miasto ?? '—';
            const przylot = trasa?.lotnisko_przylotu?.miasto ?? '—';

            let dataTekst = '—';

            if (lot?.data) {
                
                const dateOnly = lot.data.split('T')[0];
                const [y, m, d] = dateOnly.split('-');

                dataTekst = `${d}.${m}.${y}`;

                if (lot.godzina) {
                    dataTekst += ` ${lot.godzina.slice(0,5)}`;
                }
            }

            const tr = document.createElement('tr');

            tr.innerHTML = `
                <td>${b.numer_biletu ?? '—'}</td>
                <td>${wylot} → ${przylot}</td>
                <td>${dataTekst}</td>
                <td>
                    <span class="status-badge status-${b.status}">
                        ${b.status}
                    </span>
                </td>
                <td>
                    <button class="action-btn" onclick="goToChangeSeat(${b.id})">
                         Zmień miejsce
                    </button>

                    <button class="action-btn" onclick="goToRefund(${b.id})">
                         Zwrot
                    </button>

                    ${
                        b.status !== 'OPLACONY'
                            ? `<button class="action-btn pay-btn"
                                 onclick="goToPayment(${b.id})">
                                 Zapłać
                               </button>`
                            : ''
                    }
                </td>
            `;

            container.appendChild(tr);
        });

    } catch (e) {
        console.error(e);
        container.innerHTML = `
            <tr>
                <td colspan="5" style="color:red">
                     Błąd pobierania biletów
                </td>
            </tr>
        `;
    }
});



window.goToChangeSeat = function (biletId) {
    localStorage.setItem('changeSeatBiletId', biletId);
    window.location.href = '/client/client-change-seat';
};

function goToRefund(biletId) {
    localStorage.setItem('refund_bilet_id', biletId);
    window.location.href = '/client/refund';
}

function goToPayment(biletId) {
    localStorage.setItem('pay_bilet_id', String(biletId));
    window.location.href = '/client/blik-client';
}

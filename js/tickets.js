document.addEventListener('DOMContentLoaded', async () => {
    checkSession(['client']);

    const user = JSON.parse(localStorage.getItem('user'));
    const body = document.getElementById('ticketsBody');
    body.innerHTML = '';

    try {
        const bilety = await apiFetch(`/moje-bilety/${user.id}`);

        if (!bilety.length) {
            body.innerHTML = `
                <tr>
                    <td colspan="6">Nie masz jeszcze żadnych biletów</td>
                </tr>
            `;
            return;
        }

        bilety.forEach(b => {
            const tr = document.createElement('tr');

            tr.innerHTML = `
                <td>${b.numer_biletu}</td>
                <td>
                    ${b.rezerwacja.lot.trasa.lotnisko_wylotu.miasto}
                    →
                    ${b.rezerwacja.lot.trasa.lotnisko_przylotu.miasto}
                </td>
                <td>${b.rezerwacja.lot.data}</td>
                <td>${b.rezerwacja.lot.godzina}</td>
                <td>${b.miejsce.numer}</td>
                <td>${b.status}</td>
            `;

            body.appendChild(tr);
        });

    } catch (e) {
        console.error(e);
        body.innerHTML = `
            <tr>
                <td colspan="6">Błąd pobierania biletów</td>
            </tr>
        `;
    }
});

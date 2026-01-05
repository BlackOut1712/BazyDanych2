document.addEventListener('DOMContentLoaded', async () => {
    checkSession(['client']);

    const user = JSON.parse(localStorage.getItem('user'));
    const reservation = JSON.parse(localStorage.getItem('currentReservation'));

    if (!user || !reservation) {
        alert('Brak danych do płatności');
        window.location.href = 'search.html';
        return;
    }

    // symulowana cena (na razie stała)
    const price = 350;

    document.getElementById('paymentSummary').innerHTML = `
        <p><strong>Numer rezerwacji:</strong> ${reservation.id}</p>
        <p><strong>Status:</strong> ${reservation.status}</p>
        <p><strong>Kwota:</strong> ${price} zł</p>
    `;

    document.getElementById('payBtn').onclick = async () => {
        const method = document.querySelector('input[name="method"]:checked').value;

        try {
            // 🔴 UWAGA: zakładamy, że bilet już istnieje
            const bilet = await apiFetch(`/bilety?rezerwacja_id=${reservation.id}`);

            if (!bilet.length) {
                alert('Brak biletu do opłacenia');
                return;
            }

            await apiFetch('/platnosci', {
                method: 'POST',
                body: JSON.stringify({
                    kwota: price,
                    metoda: method,
                    klient_id: user.id,
                    bilet_id: bilet[0].id
                })
            });

            alert('Płatność zakończona sukcesem');
            window.location.href = 'client/tickets.html';

        } catch (e) {
            console.error(e);
            alert('Błąd płatności');
        }
    };
});

function cancel() {
    window.location.href = 'summary.html';
}

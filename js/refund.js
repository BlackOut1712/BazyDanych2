document.addEventListener('DOMContentLoaded', () => {
    checkSession(['cashier', 'admin']);
});

async function refund() {
    const numerBiletu = document.getElementById('numerBiletu').value.trim();
    const pin = document.getElementById('pin').value.trim();
    const result = document.getElementById('refundResult');

    if (!numerBiletu || !pin) {
        result.innerHTML = '<p style="color:red">Uzupełnij wszystkie pola</p>';
        return;
    }

    const user = JSON.parse(localStorage.getItem('user'));

    try {
        const res = await apiFetch('/platnosci/zwrot', {
            method: 'POST',
            body: JSON.stringify({
                numer_biletu: numerBiletu,
                pin: pin,
                pracownik_id: user.id
            })
        });

        result.innerHTML = `
            <p style="color:green">
                Zwrot wykonany poprawnie<br>
                Numer biletu: <strong>${res.numer_biletu}</strong>
            </p>
        `;

    } catch (e) {
        console.error(e);

        result.innerHTML = `
            <p style="color:red">
                Błąd zwrotu biletu
            </p>
        `;
    }
}

function goBack() {
    window.location.href = 'dashboard.html';
}

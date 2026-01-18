document.addEventListener('DOMContentLoaded', () => {
    // Dostęp: KASJER + MENADZER
    checkSession(['KASJER', 'MENADZER']);
});

/* ============================
   ZWROT BILETU
============================ */
async function refund() {
    const numerBiletu = document.getElementById('numerBiletu')?.value.trim();
    const pin = document.getElementById('pin')?.value.trim();
    const result = document.getElementById('refundResult');

    if (!result) return;
    result.innerHTML = '';

    if (!numerBiletu || !pin) {
        result.innerHTML =
            '<p style="color:red">Uzupełnij wszystkie pola</p>';
        return;
    }

    // ✅ używamy wspólnej funkcji sesji
    const user = getUser();

    if (!user || !user.id) {
        result.innerHTML =
            '<p style="color:red">Brak danych zalogowanego pracownika</p>';
        return;
    }

    try {
        const res = await apiFetch('/bilety/zwrot', {
            method: 'POST',
            body: JSON.stringify({
                numer_biletu: numerBiletu,
                pin: pin,
                pracownik_id: user.id
            })
        });

        result.innerHTML = `
            <p style="color:green">
                ✔ Zwrot wykonany poprawnie<br>
                Numer biletu: <b>${res.numer_biletu}</b><br>
                Kwota zwrotu: <b>${res.kwota} zł</b>
            </p>
        `;

        document.getElementById('numerBiletu').value = '';
        document.getElementById('pin').value = '';

    } catch (e) {
        console.error('Błąd zwrotu:', e);

        const msg =
            e?.message ||
            e?.error ||
            'Nie udało się wykonać zwrotu';

        result.innerHTML = `
            <p style="color:red">
                ❌ ${msg}
            </p>
        `;
    }
}

/* ============================
   POWRÓT DO DASHBOARDU
============================ */
function goBack() {
    // 🔴 Laravel route, NIE html
    window.location.href = '/cashier/dashboard';
}

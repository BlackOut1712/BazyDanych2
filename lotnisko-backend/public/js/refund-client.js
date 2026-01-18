document.addEventListener('DOMContentLoaded', () => {
    const phoneInput = document.getElementById('phoneNumber');

    if (!phoneInput) return;

    phoneInput.addEventListener('input', () => {
        let value = phoneInput.value.replace(/\D/g, ''); // tylko cyfry

        // max 9 cyfr
        value = value.substring(0, 9);

        // format 999 999 999
        if (value.length > 6) {
            value = value.replace(/(\d{3})(\d{3})(\d+)/, '$1 $2 $3');
        } else if (value.length > 3) {
            value = value.replace(/(\d{3})(\d+)/, '$1 $2');
        }

        phoneInput.value = value;
    });
});
async function refundBlik() {
    const phone = document.getElementById('phoneNumber').value.trim();
    const code = document.getElementById('blikCode').value.trim();
    const result = document.getElementById('refundResult');

    // =========================
    // WALIDACJA
    // =========================
    

    if (!/^\d{3} \d{3} \d{3}$/.test(phone)) {
        document.getElementById('refundResult').innerHTML =
            `<p style="color:red">Podaj numer telefonu w formacie 999 999 999</p>`;
        return;
    }

    if (!/^\d{6}$/.test(code)) {
        result.innerHTML =
            `<p style="color:red">Kod BLIK musi mieć 6 cyfr</p>`;
        return;
    }

    const biletId = localStorage.getItem('refund_bilet_id');
    if (!biletId) {
        alert('Brak biletu do zwrotu');
        window.location.href = '/client/tickets';
        return;
    }

    result.innerHTML = `<p>⏳ Przetwarzanie zwrotu...</p>`;

    // =========================
    // SYMULACJA BANKU
    // =========================
    setTimeout(async () => {
        try {
            await apiFetch('/client/bilety/zwrot', {
                method: 'POST',
                body: JSON.stringify({
                    bilet_id: biletId,
                    telefon: phone,
                    kod_blik: code
                })
            });

            result.innerHTML =
                `<p style="color:green">✔ Zwrot wykonany poprawnie</p>`;

            localStorage.removeItem('refund_bilet_id');

            setTimeout(() => {
                window.location.href = '/client/tickets';
            }, 1200);

        } catch (e) {
            console.error(e);
            result.innerHTML =
                `<p style="color:red">❌ Błąd wykonania zwrotu</p>`;
        }
    }, 1200);
}

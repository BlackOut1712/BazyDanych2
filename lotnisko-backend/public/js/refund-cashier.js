document.addEventListener('DOMContentLoaded', () => {
    const phoneInput = document.getElementById('phoneNumber');

    if (!phoneInput) return;

    phoneInput.addEventListener('input', () => {
        let value = phoneInput.value.replace(/\D/g, '').substring(0, 9);

        if (value.length > 6) {
            value = value.replace(/(\d{3})(\d{3})(\d+)/, '$1 $2 $3');
        } else if (value.length > 3) {
            value = value.replace(/(\d{3})(\d+)/, '$1 $2');
        }

        phoneInput.value = value;
    });
});

async function refundBlikCashier() {
    const pinInput = document.getElementById('clientPin');
    const result = document.getElementById('refundResult');

    if (!pinInput || !result) {
        alert('Błąd formularza');
        return;
    }

    const pin = pinInput.value.trim();

    if (pin.length < 6) {
        result.innerHTML = `<p style="color:red">PIN musi mieć min. 6 cyfr</p>`;
        return;
    }

    const biletId = localStorage.getItem('refund_bilet_id');
    if (!biletId) {
        alert('Brak biletu do zwrotu');
        window.location.href = '/cashier/menagment';
        return;
    }

    result.innerHTML = `<p>⏳ Przetwarzanie zwrotu...</p>`;

    try {
        await apiFetch(`/bilety/zwrot/${biletId}`, {
            method: 'POST',
            body: JSON.stringify({
                pin: pin
            })
        });

        result.innerHTML =
            `<p style="color:green">✔ Zwrot wykonany poprawnie</p>`;

        localStorage.removeItem('refund_bilet_id');

        setTimeout(() => {
            window.location.href = '/cashier/menagment';
        }, 1200);

    } catch (e) {
        console.error(e);
        result.innerHTML =
            `<p style="color:red"> Nieprawidłowy PIN klienta</p>`;
    }
}

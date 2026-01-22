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

async function refundBlik() {
    const pinInput = document.getElementById('blikCode'); 
    const result = document.getElementById('refundResult');

    if (!pinInput || !result) {
        alert('Błąd formularza');
        return;
    }

    const pin = pinInput.value.trim();

 
    if (!/^\d{6}$/.test(pin)) {
        result.innerHTML =
            `<p style="color:red">PIN musi mieć dokładnie 6 cyfr</p>`;
        return;
    }

    const biletId = localStorage.getItem('refund_bilet_id');
    if (!biletId) {
        alert('Brak biletu do zwrotu');
        window.location.href = '/client/tickets';
        return;
    }

    result.innerHTML = `<p> Przetwarzanie zwrotu...</p>`;

    try {
        await apiFetch('/client/bilety/zwrot', {
            method: 'POST',
            body: JSON.stringify({
                bilet_id: biletId,
                pin: pin
            })
        });

        result.innerHTML =
            `<p style="color:green"> Zwrot wykonany poprawnie</p>`;

        localStorage.removeItem('refund_bilet_id');

        setTimeout(() => {
            window.location.href = '/client/tickets';
        }, 1200);

    } catch (e) {
        console.error(e);
        result.innerHTML =
            `<p style="color:red"> Nieprawidłowy PIN</p>`;
    }
}

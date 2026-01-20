function payBlik() {
    const code = document.getElementById('blikCode').value.trim();
    const result = document.getElementById('blikResult');

    // ✅ Walidacja kodu BLIK
    if (!/^\d{6}$/.test(code)) {
        result.innerHTML =
            `<p style="color:red">Kod BLIK musi mieć 6 cyfr</p>`;
        return;
    }

    result.innerHTML = `<p>⏳ Przetwarzanie płatności...</p>`;

    // ⏳ SYMULACJA BANKU
    setTimeout(async () => {

        const role = getSessionItem('role');

        try {
            /* ======================================
               🔥 KASJER → OPŁATA ISTNIEJĄCEGO BILETU
            ====================================== */
            if (role === 'KASJER') {

                const biletId  = localStorage.getItem('blik_bilet_id');
                const clientId = localStorage.getItem('blik_client_id');

                // ❗ Twarda walidacja
                if (!biletId) {
                    alert('Brak biletu do opłacenia');
                    window.location.href = '/cashier/dashboard';
                    return;
                }

                if (!clientId) {
                    alert('Brak klienta do płatności');
                    window.location.href = '/cashier/dashboard';
                    return;
                }

                // 🔥 KLUCZ: ręcznie NADPISUJEMY klienta
                await apiFetch(`/bilety/${biletId}/pay`, {
                    method: 'POST',
                    headers: {
                        'X-Client-Id': clientId   // 👈 WYGRYWA z apiFetch
                    }
                });

                // 🧹 sprzątanie po sukcesie
                localStorage.removeItem('blik_bilet_id');
                localStorage.removeItem('blik_client_id');

                result.innerHTML =
                    `<p style="color:green">✔ Bilet opłacony poprawnie</p>`;
            }

        } catch (e) {
            console.error('Błąd płatności BLIK:', e);
            result.innerHTML =
                `<p style="color:red">❌ Błąd płatności</p>`;
            return;
        }

        // 🔐 odświeżenie sesji
        if (typeof updateActivity === 'function') {
            updateActivity();
        }

        // ⏩ przekierowanie
        setTimeout(() => {
            if (role === 'KASJER') {
                window.location.href = '/cashier/dashboard';
            } else {
                window.location.href = '/';
            }
        }, 1200);

    }, 1200);
}

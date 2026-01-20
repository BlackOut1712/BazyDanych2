function payBlik() {
    const code = document.getElementById('blikCode').value.trim();
    const result = document.getElementById('blikResult');

    if (!/^\d{6}$/.test(code)) {
        result.innerHTML = `<p style="color:red">Kod BLIK musi mieć 6 cyfr</p>`;
        return;
    }

    result.innerHTML = `<p>⏳ Przetwarzanie płatności...</p>`;

    setTimeout(async () => {
        const role = getSessionItem('role');

        try {
            if (role === 'KASJER') {
                const biletIdRaw  = localStorage.getItem('blik_bilet_id');
                const clientIdRaw = localStorage.getItem('blik_client_id');

                if (!biletIdRaw || !clientIdRaw) {
                    alert('Brak danych do płatności');
                    window.location.href = '/cashier/dashboard';
                    return;
                }

                // ✅ WYMUSZENIE TYPÓW (KLUCZOWE)
                const biletId  = Number(biletIdRaw);
                const clientId = Number(clientIdRaw);

                if (!Number.isInteger(biletId) || !Number.isInteger(clientId)) {
                    throw new Error('Nieprawidłne ID biletu lub klienta');
                }

                await apiFetch(`/bilety/${biletId}/pay`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Client-Id': clientId
                    },
                    body: JSON.stringify({}) // backend oczekuje JSON
                });

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

        if (typeof updateActivity === 'function') {
            updateActivity();
        }

        setTimeout(() => {
            if (role === 'KASJER') {
                window.location.href = '/cashier/dashboard';
            } else {
                window.location.href = '/';
            }
        }, 1200);

    }, 1200);
}

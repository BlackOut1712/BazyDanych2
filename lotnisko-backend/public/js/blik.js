
function payBlik() {
    const code = document.getElementById('blikCode').value.trim();
    const result = document.getElementById('blikResult');

    if (!/^\d{6}$/.test(code)) {
        result.innerHTML =
            `<p style="color:red">Kod BLIK musi mieć 6 cyfr</p>`;
        return;
    }

    result.innerHTML = `<p>⏳ Przetwarzanie płatności...</p>`;

    // ⏳ SYMULACJA BANKU
    setTimeout(async () => {

        result.innerHTML =
            `<p style="color:green">✔ Płatność BLIK zaakceptowana</p>`;

        // 🔐 odświeżenie aktywności sesji
        if (typeof updateActivity === 'function') {
            updateActivity();
        }

        const role = getSessionItem('role');

        /* =====================================================
           🔥 KLIENT → TWORZENIE BILETU
        ====================================================== */
        if (role === 'CLIENT') {

            const rezerwacjaId =
                localStorage.getItem('rezerwacja_id') ||
                localStorage.getItem('blik_rezerwacja_id');

            if (!rezerwacjaId) {
                alert('Błąd: brak rezerwacji do opłacenia');
                window.location.href = '/client/dashboard';
                return;
            }

            // 🔥 NOWE – dane pasażera
            const userRaw = getSessionItem('user');
            let user = null;

            try {
                user = userRaw ? JSON.parse(userRaw) : null;
            } catch (e) {}

            const imie_pasazera =
                localStorage.getItem('passengerFirstName') ||
                user?.imie ||
                '';

            const nazwisko_pasazera =
                localStorage.getItem('passengerLastName') ||
                user?.nazwisko ||
                '';

            const pesel_pasazera =
                localStorage.getItem('passengerPesel') ||
                user?.pesel ||
                '';

            try {
                await apiFetch('/bilety/kup', {
                    method: 'POST',
                    body: JSON.stringify({
                        rezerwacja_id: rezerwacjaId,
                        imie_pasazera,
                        nazwisko_pasazera,
                        pesel_pasazera
                    })
                });

                // 🧹 sprzątanie
                localStorage.removeItem('rezerwacja_id');
                localStorage.removeItem('blik_rezerwacja_id');

            } catch (e) {
                console.error('Błąd tworzenia biletu:', e);
                alert('Płatność OK, ale błąd zapisu biletu');
                return;
            }
        }

        /* =====================================================
           ⏩ PRZEKIEROWANIE
        ====================================================== */
        setTimeout(() => {
            if (role === 'CLIENT') {
                window.location.href = '/client/dashboard';
            } else if (role === 'KASJER') {
                window.location.href = '/cashier/dashboard';
            } else {
                window.location.href = '/';
            }
        }, 1200);

    }, 1200);
}

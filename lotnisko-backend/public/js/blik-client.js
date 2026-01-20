function payBlik() {
    const code = document.getElementById('blikCode').value.trim();
    const result = document.getElementById('blikResult');

    // =========================
    // WALIDACJA KODU
    // =========================
    if (!/^\d{6}$/.test(code)) {
        result.innerHTML =
            `<p style="color:red">Kod BLIK musi mieć 6 cyfr</p>`;
        return;
    }

    result.innerHTML = `<p>⏳ Przetwarzanie płatności...</p>`;

    // =========================
    // SYMULACJA BANKU
    // =========================
    setTimeout(async () => {

        result.innerHTML =
            `<p style="color:green">✔ Płatność BLIK zaakceptowana</p>`;

        // =========================
        // SPRAWDZENIE SESJI
        // =========================
        const role = getSessionItem('role');
        if (role !== 'CLIENT') {
            alert('Błąd: tylko klient może opłacić bilet');
            window.location.href = '/login';
            return;
        }

        let user = null;
        try {
            user = JSON.parse(getSessionItem('user'));
        } catch (e) {}

        if (!user?.id) {
            alert('Brak danych klienta');
            window.location.href = '/login';
            return;
        }

        // =========================
        // 🔑 ROZPOZNANIE TRYBU
        // =========================
        const existingBiletId = localStorage.getItem('pay_bilet_id');
        const rezerwacjaId = localStorage.getItem('blik_rezerwacja_id');

        // =========================
        // DANE PASAŻERA (DO NOWEGO)
        // =========================
        const imie_pasazera =
            localStorage.getItem('passengerFirstName') ||
            user.imie ||
            '—';

        const nazwisko_pasazera =
            localStorage.getItem('passengerLastName') ||
            user.nazwisko ||
            '—';

        const pesel_pasazera =
            localStorage.getItem('passengerPesel') ||
            user.pesel ||
            '00000000000';

        try {

            // =====================================
            // 🔁 ISTNIEJĄCY BILET → OPŁATA
            // =====================================
            if (existingBiletId) {

                const response = await fetch(
                    `${API_URL}/bilety/${existingBiletId}/pay`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-User-Role': 'CLIENT',
                            'X-Client-Id': user.id
                        },
                        body: JSON.stringify({
                            bilet_id: existingBiletId
                        })
                    });

                if (!response.ok) {
                    throw new Error('Błąd opłacania biletu');
                }

                localStorage.removeItem('pay_bilet_id');
            }

            // =====================================
            // 🆕 NOWA REZERWACJA → NOWY BILET
            // =====================================
            else {

                if (!rezerwacjaId) {
                    alert('Błąd: brak rezerwacji do opłacenia');
                    window.location.href = '/client/dashboard';
                    return;
                }
                const response = await fetch(
                    `${API_URL}/bilety/client`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-User-Role': 'CLIENT',
                            'X-Client-Id': user.id
                        },
                        body: JSON.stringify({
                            rezerwacja_id: rezerwacjaId,
                            imie_pasazera,
                            nazwisko_pasazera,
                            pesel_pasazera
                        })
                    }
                );
        

                if (!response.ok) {
                    throw new Error('Błąd zapisu biletu');
                }

                // cleanup danych nowej rezerwacji
                localStorage.removeItem('blik_rezerwacja_id');
                localStorage.removeItem('passengerFirstName');
                localStorage.removeItem('passengerLastName');
                localStorage.removeItem('passengerPesel');
            }

        } catch (err) {
            console.error(err);
            alert('Płatność OK, ale błąd po stronie serwera');
            return;
        }

        // =========================
        // PRZEKIEROWANIE
        // =========================
        setTimeout(() => {
            window.location.href = '/client/tickets';
        }, 1200);

    }, 1200);
}

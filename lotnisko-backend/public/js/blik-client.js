function payBlik() {
    const code = document.getElementById('blikCode').value.trim();
    const result = document.getElementById('blikResult');
    const payBtn = document.getElementById('payBtn'); // jeśli masz przycisk

    if (!/^\d{6}$/.test(code)) {
        result.innerHTML = `<p style="color:red">Kod BLIK musi mieć 6 cyfr</p>`;
        return;
    }

    
    if (payBtn) payBtn.disabled = true;
    result.innerHTML = `<p> Przetwarzanie płatności...</p>`;

    setTimeout(async () => {
        result.innerHTML = `<p style="color:green">✔ Płatność BLIK zaakceptowana</p>`;

        const role = getSessionItem('role');
        if (role !== 'CLIENT') {
            alert('Tylko klient może opłacić bilet');
            window.location.href = '/login';
            return;
        }

        let user;
        try { user = JSON.parse(getSessionItem('user')); } catch {}
        if (!user?.id) {
            alert('Brak danych klienta');
            window.location.href = '/login';
            return;
        }

        
        localStorage.removeItem('pay_bilet_id');

        const rezerwacjaId = localStorage.getItem('blik_rezerwacja_id');
        if (!rezerwacjaId) {
            alert('Rezerwacja wygasła lub została anulowana.');
            window.location.href = '/client/dashboard';
            return;
        }

        const imie_pasazera =
            localStorage.getItem('passengerFirstName') || user.imie || '—';
        const nazwisko_pasazera =
            localStorage.getItem('passengerLastName') || user.nazwisko || '—';
        const pesel_pasazera =
            localStorage.getItem('passengerPesel') || user.pesel || '00000000000';

        try {
           
            const ticketRes = await fetch(`${API_URL}/bilety/client`, {
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
            });

            if (!ticketRes.ok) {
                if (ticketRes.status === 409) {
                    alert('Rezerwacja nieaktywna. Wybierz miejsce ponownie.');
                    window.location.href = '/client/dashboard';
                    return;
                }
                throw new Error('Błąd zapisu biletu');
            }

            const bilet = await ticketRes.json();

           
            const payRes = await fetch(`${API_URL}/bilety/${bilet.id}/pay`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-Role': 'CLIENT',
                    'X-Client-Id': user.id
                }
            });

            if (!payRes.ok) {
                if (payRes.status === 409) {
                    
                    window.location.href = '/client/tickets';
                    return;
                }
                throw new Error('Błąd zapisu płatności');
            }

            
            localStorage.removeItem('blik_rezerwacja_id');
            localStorage.removeItem('passengerFirstName');
            localStorage.removeItem('passengerLastName');
            localStorage.removeItem('passengerPesel');

            window.location.href = '/client/tickets';

        } catch (err) {
            console.error(err);
            alert('Wystąpił błąd systemu');
            if (payBtn) payBtn.disabled = false;
        }
    }, 1200);
}

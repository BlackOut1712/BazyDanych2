/* ======================================================
   WALIDACJE
====================================================== */

function isOnlyDigits(value) {
    return /^\d+$/.test(value);
}

function isValidPin(pin) {
    return /^\d{6}$/.test(pin);
}

function isValidPesel(pesel) {
    return pesel.length === 11 && isOnlyDigits(pesel);
}

/* ======================================================
   REJESTRACJA KLIENTA
====================================================== */

async function register() {
    const imie = document.getElementById('imie').value.trim();
    const nazwisko = document.getElementById('nazwisko').value.trim();
    const pesel = document.getElementById('pesel').value.trim();
    const email = document.getElementById('email').value.trim();
    const login = document.getElementById('login').value.trim();
    const pin = document.getElementById('pin').value.trim();
    const pin2 = document.getElementById('pin2').value.trim();
    const terms = document.getElementById('terms').checked;

    if (!imie || !nazwisko || !pesel || !email || !login || !pin || !pin2) {
        alert('Uzupełnij wszystkie pola');
        return;
    }

    if (!isValidPesel(pesel)) {
        alert('PESEL musi składać się z 11 cyfr');
        return;
    }

    if (!isValidPin(pin)) {
        alert('PIN musi składać się z dokładnie 6 cyfr');
        return;
    }

    if (pin !== pin2) {
        alert('PIN-y nie są takie same');
        return;
    }

    if (!terms) {
        alert('Musisz zaakceptować regulamin');
        return;
    }

    try {
        const response = await fetch('http://127.0.0.1:8000/api/klienci', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                imie,
                nazwisko,
                pesel,
                numer_telefonu: '000000000', // tymczasowo (backend wymaga)
                email,
                login,
                haslo: pin
            })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || 'Błąd rejestracji');
            return;
        }

        alert('Konto utworzone! Możesz się zalogować.');
        window.location.href = 'login.html';

    } catch (err) {
        console.error(err);
        alert('Błąd połączenia z serwerem');
    }
}

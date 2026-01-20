/* ============================
   API URL (fallback)
============================ */
const API_URL = window.location.origin + '/api';


/* ============================
   WALIDATORY
============================ */
function isOnlyDigits(value) {
    return /^\d+$/.test(value);
}

function isValidPin(pin) {
    return /^\d{6}$/.test(pin);
}

function isValidPesel(pesel) {
    return /^\d{11}$/.test(pesel);
}

function isValidPhone(phone) {
    return /^\d{9}$/.test(phone); // 9 cyfr – standard PL
}

/* ============================
   REJESTRACJA KLIENTA
============================ */
async function register() {
    try {
        const imie = document.getElementById('imie').value.trim();
        const nazwisko = document.getElementById('nazwisko').value.trim();
        const pesel = document.getElementById('pesel').value.trim();
        const email = document.getElementById('email').value.trim();
        const telefon = document.getElementById('telefon').value.trim();
        const pin = document.getElementById('pin').value.trim();
        const pin2 = document.getElementById('pin2').value.trim();
        const terms = document.getElementById('terms').checked;

        if (!imie || !nazwisko || !pesel || !email || !telefon || !pin || !pin2) {
            alert('Uzupełnij wszystkie pola');
            return;
        }

        if (!isValidPesel(pesel)) {
            alert('PESEL musi składać się z 11 cyfr');
            return;
        }

        if (!isValidPhone(telefon)) {
            alert('Numer telefonu musi składać się z 9 cyfr');
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

        /* ============================
           REJESTRACJA
        ============================ */
        const registerResponse = await fetch(`${API_URL}/klienci`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                imie,
                nazwisko,
                pesel,
                numer_telefonu: telefon,
                email,
                haslo: pin
            })
        });

        const registerData = await registerResponse.json();

        if (!registerResponse.ok) {
            alert(registerData?.message || 'Błąd rejestracji');
            return;
        }

        /* ============================
           AUTO-LOGIN (ZGODNY Z AuthController)
        ============================ */
        const loginResponse = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                identifier: email,
                secret: pin
            })
        });

        const loginData = await loginResponse.json();

        if (!loginResponse.ok) {
            alert('Konto utworzone, ale nie udało się zalogować');
            window.location.href = '/login';
            return;
        }

        /* ============================
           SESJA (BEZ TOKENA – JAK MASZ W SYSTEMIE)
        ============================ */
        localStorage.setItem('userRole', loginData.role);
        localStorage.setItem('userId', loginData.user.id);

        window.location.href = '/client/dashboard';

    } catch (error) {
        console.error(error);
        alert('Błąd połączenia z serwerem');
    }
}

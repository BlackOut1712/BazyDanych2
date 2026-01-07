/* ======================================================
   WALIDACJE
====================================================== */

// e-mail
function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

// PIN – dokładnie 6 cyfr
function isValidPin(value) {
    return /^\d{6}$/.test(value);
}

// hasło – min 6 znaków, litera + cyfra
function isValidPassword(value) {
    return (
        value.length >= 6 &&
        /[a-zA-Z]/.test(value) &&
        /\d/.test(value)
    );
}

/* ======================================================
   SESJA
====================================================== */

function startSession(role, user, remember) {
    localStorage.setItem('role', role);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('lastActivity', Date.now());

    if (remember) {
        localStorage.setItem('remember', '1');
    } else {
        localStorage.removeItem('remember');
    }
}

/* ======================================================
   LOGOWANIE
====================================================== */

async function login() {
    const identifier = document.getElementById('identifier').value.trim();
    const secret = document.getElementById('secret').value.trim();
    const remember = document.getElementById('remember')?.checked;

    if (!identifier || !secret) {
        alert('Uzupełnij wszystkie pola');
        return;
    }

    // 🔍 WALIDACJA FRONTEND
    if (isValidEmail(identifier)) {
        // klient
        if (secret.length < 6) {
            alert('Hasło musi mieć co najmniej 6 znaków');
            return;
        }
    } else {
        // pracownik
        if (!isValidPassword(secret) && !isValidPin(secret)) {
            alert(
                'Hasło musi mieć min. 6 znaków i zawierać literę oraz cyfrę\n' +
                'lub być 6-cyfrowym PIN-em'
            );
            return;
        }
    }

    try {
        const response = await fetch('http://127.0.0.1:8000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                identifier,
                secret
            })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || 'Błąd logowania');
            return;
        }

        if (!data.role || !data.user) {
            alert('Błąd odpowiedzi serwera (brak roli)');
            return;
        }

        const role = data.role.toUpperCase();
		const user = data.user;

		// 💾 START SESJI
		startSession(role, user, remember);
        
		// 🔀 PRZEKIEROWANIA
		switch (role) {

			case 'CLIENT':
				window.location.href = 'client/dashboard.html';
				break;

			case 'KASJER':
				window.location.href = 'cashier/dashboard.html';
				break;

			case 'MENADZER':
				window.location.href = 'admin/dashboard.html';
				break;

			default:
				alert('Nieznana rola użytkownika: ' + role);
		}

    } catch (err) {
        console.error(err);
        alert('Błąd połączenia z serwerem');
    }
}

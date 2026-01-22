
function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}


function isValidPin(value) {
    return /^\d{6}$/.test(value);
}


function isValidPassword(value) {
    return (
        value.length >= 6 &&
        /[a-zA-Z]/.test(value) &&
        /\d/.test(value)
    );
}

function startSession(role, user, remember) {
    const storage = remember ? localStorage : sessionStorage;
    const obsoleteStorage = remember ? sessionStorage : localStorage;

   
    ['role', 'user', 'user_id', 'user_role', 'lastActivity', 'remember']
        .forEach(key => obsoleteStorage.removeItem(key));


    storage.setItem('role', role);
    storage.setItem('user_role', role); 
    storage.setItem('user', JSON.stringify(user));
    storage.setItem('lastActivity', Date.now().toString());


    if (user) {
        
        if (user.id) {
            storage.setItem('user_id', user.id);
        } else if (user.klient_id) {
            storage.setItem('user_id', user.klient_id);
        }
    }

    if (remember) {
        storage.setItem('remember', '1');
    }
}

async function login() {
    const identifier = document.getElementById('identifier')?.value.trim();
    const secret = document.getElementById('secret')?.value.trim();
    const remember = document.getElementById('remember')?.checked;

    if (!identifier || !secret) {
        alert('Uzupełnij wszystkie pola');
        return;
    }

    
    if (isValidEmail(identifier)) {
        if (secret.length < 6) {
            alert('Hasło musi mieć co najmniej 6 znaków');
            return;
        }
    } else {
        if (!isValidPassword(secret) && !isValidPin(secret)) {
            alert(
                'Hasło musi mieć min. 6 znaków i zawierać literę oraz cyfrę\n' +
                'lub być 6-cyfrowym PIN-em'
            );
            return;
        }
    }

    try {
        const response = await fetch(
            window.location.origin + '/api/login',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ identifier, secret })
            }
        );

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

        
        startSession(role, user, remember);
        console.log('Zalogowano jako:', role, user);

        switch (role) {
            case 'CLIENT':
                window.location.href = '/client/dashboard';
                break;
            case 'KASJER':
                window.location.href = '/cashier/dashboard';
                break;
            case 'MENADZER':
                window.location.href = '/admin/dashboard';
                break;
            default:
                alert('Nieznana rola użytkownika: ' + role);
        }

    } catch (err) {
        console.error(err);
        alert('Błąd połączenia z serwerem');
    }
}

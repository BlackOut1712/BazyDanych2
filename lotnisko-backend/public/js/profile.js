document.addEventListener('DOMContentLoaded', () => {
    loadProfile();
});
document.getElementById('passwordForm')?.addEventListener('submit', async e => {
    e.preventDefault();

    const current = document.getElementById('current_password').value.trim();
    const pass1 = document.getElementById('new_password').value.trim();
    const pass2 = document.getElementById('new_password_confirm').value.trim();

    
    const pinRegex = /^\d{6}$/;

    if (!pinRegex.test(current)) {
        alert('Aktualny PIN musi składać się dokładnie z 6 cyfr');
        return;
    }

    if (!pinRegex.test(pass1)) {
        alert('Nowy PIN musi składać się dokładnie z 6 cyfr');
        return;
    }

    if (pass1 !== pass2) {
        alert('Nowe PIN-y nie są identyczne');
        return;
    }

    try {
        await apiFetch('/client/profile', {
            method: 'PUT',
            body: JSON.stringify({
                current_password: current,
                new_password: pass1
            })
        });

        alert('PIN został zmieniony');
        e.target.reset();

    } catch (e) {
        console.error(e);
        alert(e.message || 'Błąd zmiany PIN-u');
    }
});


async function loadProfile() {
    try {
       
        const user = await apiFetch('/client/profile');

        document.getElementById('imie').value = user.imie ?? '';
        document.getElementById('nazwisko').value = user.nazwisko ?? '';
        document.getElementById('pesel').value = user.pesel ?? '';
        document.getElementById('email').value = user.email ?? '';
        document.getElementById('numer_telefonu').value = user.numer_telefonu ?? '';

    } catch (e) {
        console.error(e);
        alert('Nie udało się pobrać danych profilu');
    }
}


document.getElementById('profileForm')?.addEventListener('submit', async e => {
    e.preventDefault();

    const payload = {
        email: document.getElementById('email').value.trim(),
        numer_telefonu: document.getElementById('numer_telefonu').value.trim()
    };

    try {
        
        await apiFetch('/client/profile', {
            method: 'PUT',
            body: JSON.stringify(payload)
        });

        alert('Dane profilu zapisane');

    } catch (e) {
        console.error(e);
        alert(e.message || 'Błąd zapisu danych');
    }
});


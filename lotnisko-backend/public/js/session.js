const SESSION_TIMEOUT = 10 * 60 * 1000; // 10 minut
console.log("UWAGA");

function updateActivity() {
    const now = Date.now().toString();

    if (localStorage.getItem('remember')) {
        localStorage.setItem('lastActivity', now);
    } else {
        sessionStorage.setItem('lastActivity', now);
    }
}

/* ======================================================
   DANE SESJI
====================================================== */

function getRole() {
    const role = getSessionItem('role');
    return role ? role.trim().toUpperCase() : null;
}

function getUser() {
    const user = getSessionItem('user');
    return user ? JSON.parse(user) : null;
}

/* ======================================================
   SPRAWDZANIE SESJI (LARAVEL SAFE)
====================================================== */

/* ======================================================
   SPRAWDZANIE SESJI (LARAVEL SAFE)
====================================================== */

function checkSession(roles = []) {

    console.log("Sprawdzam sesję...");
    console.log("Rola z getSessionItem:", getSessionItem('role'));
    console.log("Aktywność z getSessionItem:", getSessionItem('lastActivity'));

    const role = getRole();
    const lastActivity = Number(getSessionItem('lastActivity'));
    const isRemembered = localStorage.getItem('remember');

    const currentPath = window.location.pathname;

    // ⛔ JEŚLI JESTEŚMY NA /login LUB /register → NIE SPRAWDZAMY SESJI
    if (currentPath === '/login' || currentPath === '/register') {
        return;
    }

    // brak sesji
    if (!role || !lastActivity) {
        logout();
        return;
    }

    // timeout
    if (!isRemembered && Date.now() - lastActivity > SESSION_TIMEOUT) {
        alert('Sesja wygasła');
        logout();
        return;
    }

    // normalizacja ról
    const allowedRoles = roles.map(r => r.toUpperCase());

    // brak dostępu
    if (allowedRoles.length && !allowedRoles.includes(role)) {
        alert('Brak dostępu do tego panelu');
        logout();
        return;
    }

    updateActivity();
}

/* ======================================================
   LOGOUT (LARAVEL ROUTES)
====================================================== */

function logout() {
    localStorage.clear();
    sessionStorage.clear();

    // zawsze route, nigdy plik
    window.location.href = '/login';
}

/* ======================================================
   SESJA – POBIERANIE DANYCH
====================================================== */

function getSessionItem(key) {
    return sessionStorage.getItem(key) || localStorage.getItem(key);
}

/* ======================================================
   AKTYWNOŚĆ UŻYTKOWNIKA
====================================================== */

['click', 'mousemove', 'keydown'].forEach(event => {
    document.addEventListener(event, updateActivity);
});
function getClientId() {
    return getSessionItem('client_id');
}
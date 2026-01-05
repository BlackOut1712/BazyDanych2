const SESSION_TIMEOUT = 10 * 60 * 1000; // 10 minut

/* ======================================================
   AKTYWNOŚĆ
====================================================== */

function updateActivity() {
    localStorage.setItem('lastActivity', Date.now().toString());
}

/* ======================================================
   DANE SESJI
====================================================== */

function getRole() {
    const role = localStorage.getItem('role');
    return role ? role.trim().toUpperCase() : null;
}

function getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

/* ======================================================
   SPRAWDZANIE SESJI
   roles = ['MENADZER'] | ['KASJER'] | ['CLIENT']
====================================================== */

function checkSession(roles = []) {
    const role = getRole();
    const lastActivity = Number(localStorage.getItem('lastActivity'));

    // brak sesji
    if (!role || !lastActivity) {
        logout();
        return;
    }

    // timeout
    if (Date.now() - lastActivity > SESSION_TIMEOUT) {
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
   WYLOGOWANIE (UNIWERSALNE)
====================================================== */

function logout() {
    localStorage.clear();

    let basePath;

    if (location.protocol === 'file:') {
        // cofamy się do katalogu głównego projektu
        basePath = location.href.substring(0, location.href.lastIndexOf('/'));
        basePath = basePath.substring(0, basePath.lastIndexOf('/'));
    } else {
        basePath = location.origin;
    }

    window.location.href = basePath + '/index.html';
}

/* ======================================================
   NASŁUCH AKTYWNOŚCI
====================================================== */

['click', 'mousemove', 'keydown'].forEach(event => {
    document.addEventListener(event, updateActivity);
});

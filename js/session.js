const SESSION_TIMEOUT = 10 * 60 * 1000; // 10 minut
console.log("UWAGA");
/* ======================================================
   AKTYWNOŚĆ
====================================================== */

function updateActivity() {
    const now = Date.now().toString();
    
    // Sprawdzamy, gdzie zapisana jest sesja (na podstawie flagi 'remember')
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
   SPRAWDZANIE SESJI
   roles = ['MENADZER'] | ['KASJER'] | ['CLIENT']
====================================================== */

function checkSession(roles = []) {

    console.log("Sprawdzam sesję...");
    console.log("Rola z getSessionItem:", getSessionItem('role'));
    console.log("Aktywność z getSessionItem:", getSessionItem('lastActivity'));

    const role = getRole();
    const lastActivity = Number(getSessionItem('lastActivity'));
    
    const isRemembered = localStorage.getItem('remember');
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
   WYLOGOWANIE (UNIWERSALNE)
====================================================== */

function logout() {
    // 1. Czyścimy oba magazyny
    localStorage.clear();
    sessionStorage.clear();

    // 2. Inteligentne przekierowanie
    // Sprawdzamy, czy jesteśmy głębiej w strukturze folderów (np. w /client/)
    const path = window.location.pathname;

    if (path.includes('/client/') || 
        path.includes('/admin/') || 
        path.includes('/cashier/')) {
        
        // Jeśli jesteśmy w podfolderze, musimy wyjść "w górę"
        window.location.href = '../index.html';
        
    } else {
        // Jeśli jesteśmy w głównym folderze (np. login.html), zostajemy tu
        window.location.href = 'index.html';
    }
}

/**
 * Pobiera dane z sessionStorage LUB localStorage (priorytet ma sesja aktywna)
 */
function getSessionItem(key) {
    return sessionStorage.getItem(key) || localStorage.getItem(key);
};

/* ======================================================
   NASŁUCH AKTYWNOŚCI
====================================================== */

['click', 'mousemove', 'keydown'].forEach(event => {
    document.addEventListener(event, updateActivity);
});


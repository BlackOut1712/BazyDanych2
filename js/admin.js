document.addEventListener('DOMContentLoaded', () => {
    // 🔐 dostęp tylko dla MENADŻERA
    checkSession(['MENADZER']);
});

/* ======================================================
   NAWIGACJA – PANEL MENADŻERA
====================================================== */

function goToWorkers() {
    window.location.href = 'workers.html';
}

function goToFlights() {
    window.location.href = 'flights.html';
}

function goToPlanes() {
    window.location.href = 'planes.html';
}

function goToStats() {
    window.location.href = 'stats.html';
}

/* ======================================================
   WYLOGOWANIE
====================================================== */

function logout() {
    localStorage.clear();
    window.location.href = 'login.html';
}

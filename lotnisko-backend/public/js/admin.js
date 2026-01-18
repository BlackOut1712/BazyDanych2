document.addEventListener('DOMContentLoaded', () => {
    // dostęp tylko dla MENADŻERA
    checkSession(['MENADZER']);
});

/* =========================
   NAWIGACJA – ADMIN
========================= */

function goToWorkers() {
    window.location.href = '/admin/workers';
}

function goToFlights() {
    window.location.href = '/admin/flights';
}

function goToPlanes() {
    window.location.href = '/admin/planes';
}

function goToStats() {
    window.location.href = '/admin/stats';
}

/* =========================
   WYLOGOWANIE
========================= */

function logout() {
    // czyścimy sesję
    localStorage.clear();
    sessionStorage.clear();

    // Laravel route (bez index.html)
    window.location.href = '/login';
}

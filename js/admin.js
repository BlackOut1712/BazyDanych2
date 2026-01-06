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

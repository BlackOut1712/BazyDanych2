document.addEventListener('DOMContentLoaded', () => {
    //dostęp tylko dla MENADŻERA
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
   WYLOGOWANIE (POPRAWIONE)
====================================================== */

function logout() {
    //Czyścimy oba magazyny
    localStorage.clear();
    sessionStorage.clear();

    const path = window.location.pathname;

    if (path.includes('/client/') || 
        path.includes('/admin/') || 
        path.includes('/cashier/')) {
        
        // Jeśli jesteśmy w podfolderze, musimy wyjść
        window.location.href = '../index.html';
        
    } else {
        // Jeśli jesteśmy w głównym folderze
        window.location.href = 'index.html';
    }
}


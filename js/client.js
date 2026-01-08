document.addEventListener('DOMContentLoaded', () => {
    checkSession(['CLIENT']);

    const user = getUser();
    if (user) {
        const welcome = document.getElementById('welcomeText');
        welcome.textContent = `Witaj, ${user.imie}`;
    }
});

/* =============================
   NAWIGACJA
============================= */

function goToTickets() {
    window.location.href = 'tickets.html';
}

function goToHistory() {
    window.location.href = 'history.html';
}

function goToSearch() {
    window.location.href = 'index.html';
}

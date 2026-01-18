document.addEventListener('DOMContentLoaded', () => {
    checkSession(['CLIENT']);

    const user = getUser();
    if (user) {
        const welcome = document.getElementById('welcomeText');
        welcome.textContent = `Witaj, ${user.imie}`;
    }
});



function goToTickets() {
    window.location.href = '/client/tickets';
}

function goToHistory() {
    window.location.href = '/client/history';
}

function goToSearch() {
    window.location.href = '/client/search';
}

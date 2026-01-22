document.addEventListener('DOMContentLoaded', () => {
    
    checkSession(['MENADZER']);
});


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



function logout() {
    
    localStorage.clear();
    sessionStorage.clear();

    
    window.location.href = '/login';
}

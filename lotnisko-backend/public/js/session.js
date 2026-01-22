const SESSION_TIMEOUT = 10 * 60 * 1000; 
console.log("UWAGA");

function updateActivity() {
    const now = Date.now().toString();

    if (localStorage.getItem('remember')) {
        localStorage.setItem('lastActivity', now);
    } else {
        sessionStorage.setItem('lastActivity', now);
    }
}



function getRole() {
    const role = getSessionItem('role');
    return role ? role.trim().toUpperCase() : null;
}

function getUser() {
    const user = getSessionItem('user');
    return user ? JSON.parse(user) : null;
}



function checkSession(roles = []) {

    console.log("Sprawdzam sesję...");
    console.log("Rola z getSessionItem:", getSessionItem('role'));
    console.log("Aktywność z getSessionItem:", getSessionItem('lastActivity'));

    const role = getRole();
    const lastActivity = Number(getSessionItem('lastActivity'));
    const isRemembered = localStorage.getItem('remember');

    const currentPath = window.location.pathname;

    
    if (currentPath === '/login' || currentPath === '/register') {
        return;
    }

    if (!role || !lastActivity) {
        logout();
        return;
    }


    if (!isRemembered && Date.now() - lastActivity > SESSION_TIMEOUT) {
        alert('Sesja wygasła');
        logout();
        return;
    }

    const allowedRoles = roles.map(r => r.toUpperCase());

    if (allowedRoles.length && !allowedRoles.includes(role)) {
        alert('Brak dostępu do tego panelu');
        logout();
        return;
    }

    updateActivity();
}



function logout() {
    localStorage.clear();
    sessionStorage.clear();

    
    window.location.href = '/login';
}



function getSessionItem(key) {
    return sessionStorage.getItem(key) || localStorage.getItem(key);
}



['click', 'mousemove', 'keydown'].forEach(event => {
    document.addEventListener(event, updateActivity);
});
function getClientId() {
    return getSessionItem('client_id');
}
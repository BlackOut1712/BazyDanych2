
const API_URL = window.location.origin + '/api';


async function apiFetch(endpoint, options = {}) {
    const role = getSessionItem('role');

    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json', 
        ...(options.headers || {})
    };


    if (role) {
        headers['X-User-Role'] = role.toUpperCase();
        headers['X-User-Role-Raw'] = role;
    }


    const userRaw = getSessionItem('user');
    if (userRaw) {
        try {
            const user = JSON.parse(userRaw);
            if (user?.id && !headers['X-Client-Id']) {
                headers['X-Client-Id'] = user.id;
            }
        } catch (e) {
            console.warn('Nie udało się sparsować user z sesji');
        }
    }

    const method = options.method || 'GET';

    console.log('[apiFetch]', API_URL + endpoint, method);

    let response;
    try {
        response = await fetch(API_URL + endpoint, {
            method,
            headers,
            body: options.body ?? undefined,

            
            mode: 'cors',
            credentials: 'include' 
        });
    } catch (e) {
        console.error('Błąd sieci / CORS:', e);
        throw new Error('Brak połączenia z API');
    }

    if (!response.ok) {
        let error;
        try {
            error = await response.json();
        } catch {
            throw new Error(`Błąd serwera (${response.status})`);
        }
        throw error;
    }

    
    if (response.status === 204) return null;

    return response.json();
}


function getSessionItem(key) {
    return sessionStorage.getItem(key) || localStorage.getItem(key);
}

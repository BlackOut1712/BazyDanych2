// 🔥 AUTOMATYCZNIE DZIAŁA:
// - localhost
// - LAN (192.168.x.x)
// - ngrok
const API_URL = window.location.origin + '/api';

/* ===============================
   API FETCH – WERSJA ODPORNA
================================ */
async function apiFetch(endpoint, options = {}) {
    const role = getSessionItem('role');

    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json', // ✅ KLUCZOWE – JSON ZAMIAST HTML
        ...(options.headers || {})
    };

    /* ===============================
       🔐 ROLA UŻYTKOWNIKA
    ================================ */
    if (role) {
        headers['X-User-Role'] = role.toUpperCase();
        headers['X-User-Role-Raw'] = role;
    }

    /* ===============================
       👤 ID KLIENTA
    ================================ */
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

            // 🔥🔥🔥 KLUCZOWE DODATKI – NIE USUWAĆ
            mode: 'cors',
            credentials: 'include' // ✅ SESJE / LOGOWANIE LARAVEL
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

    // DELETE / 204
    if (response.status === 204) return null;

    return response.json();
}

/* ===============================
   SESSION STORAGE
================================ */
function getSessionItem(key) {
    return sessionStorage.getItem(key) || localStorage.getItem(key);
}

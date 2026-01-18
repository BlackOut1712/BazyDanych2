const API_URL = 'http://127.0.0.1:8000/api';


/* ===============================
   API FETCH – WERSJA ODPORNA
================================ */
async function apiFetch(endpoint, options = {}) {
    const role = getSessionItem('role');

    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {})
    };

    /* ===============================
       🔐 ROLA UŻYTKOWNIKA
       ✅ BACKEND: DUŻE LITERY
       ✅ KOMPATYBILNOŚĆ: ZOSTAWIAMY RAW
    ================================ */
    if (role) {
        // 🔥 KLUCZOWE – backend (Laravel)
        headers['X-User-Role'] = role.toUpperCase();

        // 🔧 OPCJONALNE – kompatybilność wstecz
        headers['X-User-Role-Raw'] = role;
    }

    /* ===============================
       👤 ID KLIENTA (DO HISTORII / MOJE)
       🔥 NIC NIE USUWAMY
    ================================ */
    const userRaw = getSessionItem('user');
    if (userRaw) {
        try {
            const user = JSON.parse(userRaw);
            if (user && user.id) {
                headers['X-Client-Id'] = user.id;
            }
        } catch (e) {
            console.warn('Nie udało się sparsować user z sesji');
        }
    }

    const method = options.method || 'GET';

    console.log('[apiFetch]', API_URL + endpoint, method, headers);

    let response;

    try {
        response = await fetch(API_URL + endpoint, {
            method: method,
            headers: headers,
            body: options.body ?? undefined, // 🔥 bezpieczne
            mode: 'cors',
            credentials: 'omit'
        });
    } catch (networkError) {
        console.error('Błąd sieci / CORS:', networkError);
        throw new Error('Brak połączenia z serwerem API');
    }

    if (!response.ok) {
        let errorData = null;

        try {
            errorData = await response.json();
        } catch (e) {
            throw new Error(
                `Błąd serwera (${response.status}) dla ${endpoint}`
            );
        }

        console.error('API error:', errorData);
        throw errorData;
    }

    // 🔥 NIE każda poprawna odpowiedź MUSI mieć body (np. DELETE)
    const contentLength = response.headers.get('content-length');

    if (contentLength === '0' || response.status === 204) {
        return null;
    }

    try {
        return await response.json();
    } catch (e) {
        throw new Error('Niepoprawna odpowiedź JSON z API');
    }
}

/* ===============================
   SESSION STORAGE
================================ */
function getSessionItem(key) {
    return sessionStorage.getItem(key) || localStorage.getItem(key);
}

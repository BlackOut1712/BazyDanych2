<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <title>Zarezerwuj nowy lot</title>

    <link rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="/css/style.css">

    <!-- SESJA -->
    <script src="/js/session.js"></script>
    <script>
        checkSession(['CLIENT']);
    </script>
</head>
<body>

<!-- TOP BAR -->
<header class="top-bar">
    <div class="logo">Lotnisko</div>
    
    <div class="top-actions">
        <span class="role-label">Klient</span>
        <button class="btn-secondary" onclick="goBack()">
            ⬅ Wróć do panelu
        </button>

        
        <button class="btn-secondary" onclick="logout()">Wyloguj</button>
    </div>
</header>

<main class="container">

    

    <!-- PANEL WYSZUKIWANIA -->
    <section class="card search-card">

        <div class="search-field">
            <label>Data wylotu:</label>
            <input type="date" id="date">
        </div>

        <div class="search-field">
            <label>Skąd?</label>
            <input type="text" id="from" placeholder="Miasto wylotu">
        </div>

        <div class="search-field">
            <label>Dokąd?</label>
            <input type="text" id="to" placeholder="Miasto przylotu">
        </div>

        <button type="button" class="search-btn" onclick="searchFlights()">
            Szukaj <i class="fa-solid fa-magnifying-glass"></i>
        </button>

    </section>

    <!-- WYNIKI -->
    <section class="card results">

        <div class="results-header">
            <span>Godzina</span>
            <span>Trasa</span>
            <span>Data</span>
            <span>Cena</span>
            <span>Akcja</span>
        </div>

        <div id="flights-container">
            <div class="no-results">
                Wprowadź kryteria i kliknij „Szukaj”
            </div>
        </div>

    </section>

</main>

<script src="/js/app.js"></script>
<script src="/js/client-search.js"></script>
<script>
function goBack() {
    window.location.href = '/client/dashboard';
}
</script>

</body>
</html>

<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <title>Wyszukiwanie lotów – Kasjer</title>

    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="{{ asset('css/style.css') }}">
</head>
<body>

<header class="top-bar">
    <div class="logo">
        <a href="/cashier/dashboard">Lotnisko</a>
    </div>

    <!-- PRAWA STRONA: PRZYCISKI OBOK SIEBIE -->
    <div class="actions actions-inline">
        <button type="button" class="btn-secondary" onclick="goBack()">
            ⬅ Wróć do panelu kasjera
        </button>

        <button class="btn-secondary" onclick="logout()">
            Wyloguj
        </button>
    </div>
</header>

<main class="search-page">

    <!-- PANEL WYSZUKIWANIA -->
    <div class="search-card">

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

    </div>

    <!-- LISTA WYNIKÓW -->
    <div class="results">

        <div class="results-header">
            <span>Godzina wylotu</span>
            <span>Trasa</span>
            <span>Data</span>
            <span>Cena</span>
        </div>

        <div id="flights-container">
            <div class="no-results">
                Wprowadź kryteria i kliknij „Szukaj”
            </div>
        </div>

    </div>

</main>

<script src="/js/session.js"></script>
<script src="/js/app.js"></script>
<script src="/js/cashier-search.js"></script>
<script>
    function goBack() {
        window.location.href = '/cashier/dashboard';
    }
</script>
<script>
    checkSession(['KASJER']);
</script>
</body>
</html>

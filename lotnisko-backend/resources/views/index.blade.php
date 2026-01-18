<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <title>Wyszukiwanie lotów</title>
    <link rel="stylesheet" href="/css/style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>

<header class="top-bar">
    <!-- ❌ index.html → ✅ route "/" -->
    <div class="logo"><a href="/">Lotnisko</a></div>

    <div class="top-actions">
        <!-- ❌ register.html → ✅ /register -->
        <a href="/register">Zarejestruj się</a>

        <!-- ❌ login.html → ✅ /login -->
        <a href="/login">Zaloguj się</a>
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

        <button class="search-btn" onclick="searchFlights()">
            Szukaj <i class="fa-solid fa-magnifying-glass"></i>
        </button>
    </div>

    <!-- LISTA WYNIKÓW -->
    <div class="results">
        <div class="results-header">
            <span>Godzina odlotu</span>
            <span>Trasa</span>
            <span>Data</span>
            <span>Cena</span>
            <span> </span>
        </div>

        <div id="flights-container"></div>
    </div>

</main>
<script src="/js/index.js"></script>
<script src="/js/app.js"></script>
</body>
</html>

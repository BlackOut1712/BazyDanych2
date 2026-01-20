<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <title>Statystyki</title>
    <link rel="stylesheet" href="/css/style.css">
</head>
<body class="stats-page">

<header class="top-bar">
    <div class="logo">
        <a href="/admin/dashboard">Lotnisko</a>
    </div>

    <!-- 🔥 POPRAWIONE PRZYCISKI -->
    <div class="top-actions">
        <button class="btn-secondary" onclick="goBack()">
            ← Wróć do panelu menadżera
        </button>
        <button class="btn-secondary" onclick="logout()">Wyloguj</button>
    </div>
</header>

<main class="container">

    <!-- ===== FILTR OKRESU ===== -->
    <section class="card">
        <h2>Statystyki</h2>

        <div class="stats-filter">
            <label for="periodSelect">Zakres danych</label>
            <select id="periodSelect" onchange="loadStats()">
                <option value="day">Dzisiaj</option>
                <option value="week">Ostatnie 7 dni</option>
                <option value="month">Ostatnie 30 dni</option>
            </select>
        </div>
    </section>

    <!-- ===== KAFLE STATYSTYK ===== -->
    <section class="stats-grid">
        <div class="card stat-card">
            <h3>Liczba lotów</h3>
            <p id="statFlights">–</p>
        </div>

        <div class="card stat-card">
            <h3>Rezerwacje</h3>
            <p id="statReservations">–</p>
        </div>

        <div class="card stat-card">
            <h3>Sprzedane bilety</h3>
            <p id="statTickets">–</p>
        </div>

        <div class="card stat-card">
            <h3>Przychód</h3>
            <p id="statRevenue">–</p>
        </div>
    </section>

    <!-- ===== NAJPOPULARNIEJSZE TRASY ===== -->
    <section class="card">
        <h3>Najpopularniejsze trasy</h3>

        <table class="employees-table">
            <thead>
                <tr>
                    <th>Trasa</th>
                    <th>Liczba biletów</th>
                </tr>
            </thead>
            <tbody id="popularFlightsBody">
                <tr>
                    <td colspan="2">Ładowanie…</td>
                </tr>
            </tbody>
        </table>
    </section>

</main>

<script src="/js/session.js"></script>
<script src="/js/app.js"></script>
<script src="/js/stats.js"></script>

<script>
    checkSession(['MENADZER']);

    function goBack() {
        window.location.href = '/admin/dashboard';
    }
</script>

</body>
</html>

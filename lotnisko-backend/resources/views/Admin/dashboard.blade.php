<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <title>Panel menadżera</title>
    <link rel="stylesheet" href="/css/style.css">
</head>
<body>

<!-- GÓRNY PASEK -->
<header class="top-bar">
    <div class="logo">
        <a href="/cashier/dashboard">Lotnisko</a>
    </div>

    <!-- PRAWA STRONA -->
    <div class="top-actions">
        <span class="role-label">Menadżer</span>
        <button class="btn-secondary" onclick="logout()">Wyloguj</button>
    </div>
</header>

<!-- GŁÓWNA ZAWARTOŚĆ -->
<main class="container">

    <section class="card card-header">
        <h2>Panel menadżera</h2>
        <p>Zarządzaj personelem oraz danymi systemowymi lotniska</p>
    </section>

    <!-- AKCJE -->
    <section class="card-grid manager-actions">

        <div class="card action-card" onclick="goToWorkers()">
            <h3>Zarządzanie personelem</h3>
            <p>Dodawaj, edytuj i blokuj pracowników</p>
        </div>

        <div class="card action-card" onclick="goToFlights()">
            <h3>Zarządzanie lotami</h3>
            <p>Przegląd i edycja lotów</p>
        </div>

        <div class="card action-card" onclick="goToPlanes()">
            <h3>Samoloty</h3>
            <p>Flota i konfiguracja miejsc</p>
        </div>

        <div class="card action-card" onclick="goToStats()">
            <h3>Statystyki</h3>
            <p>Sprzedaż, rezerwacje, obłożenie</p>
        </div>

    </section>

</main>

<!-- SESJA -->
<script src="/js/session.js"></script>

<!-- LOGIKA PANELU -->
<script src="/js/admin.js"></script>

<script>
    checkSession(['MENADZER']);
</script>

</body>
</html>

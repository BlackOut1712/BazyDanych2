<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <title>Panel kasjera</title>
    <link rel="stylesheet" href="/css/style.css">
</head>
<body>


<header class="top-bar">
    <div class="logo">
        <a href="/cashier/dashboard">Lotnisko</a>
    </div>

    
    <div class="top-actions">
        <span class="role-label">Kasjer</span>
        <button class="btn-secondary" onclick="logout()">Wyloguj</button>
    </div>
</header>


<main class="container">

    <section class="card card-header">
        <h2>Panel kasjera</h2>
        <p>Sprzedaż biletów, zarządzanie biletami oraz Wyszukiwarka lotów</p>
    </section>

    
    <section class="card-grid cashier-actions">

        <div class="card action-card" onclick="goToSell()">
            <h3>Sprzedaż</h3>
            <p>Sprzedaj bilet klientowi</p>
        </div>

        <div class="card action-card" onclick="goToMenagment()">
            <h3>Zarządzanie biletami</h3>
            <p>Zarządzanie istniejącymi biletami</p>
        </div>

        <div class="card action-card" onclick="goToSearch()">
            <h3>Wyszukiwarka lotów</h3>
            <p>Wyszukiwanie połączeń lotniczych i informacji o nich</p>
        </div>

    </section>

</main>

<script src="/js/session.js"></script>
<script src="/js/cashier.js"></script>
<script>
    checkSession(['KASJER']);
</script>

</body>
</html>

<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <title>Panel klienta</title>
    <link rel="stylesheet" href="/css/style.css">

    <script src="/js/session.js"></script>
    <script>
        checkSession(['CLIENT']);
    </script>
</head>
<body>


<header class="top-bar">
    <div class="logo">
        <a href="/client/dashboard">Lotnisko</a>
    </div>

    <div class="top-actions">
        <span class="role-label">Klient</span>
        <button class="btn-secondary" onclick="goToProfile()">
            Mój profil
        </button>
        <button class="btn-secondary" onclick="logout()">Wyloguj</button>
    </div>
</header>


<main class="container">

 
    <section class="card card-header">
        <h2 id="welcomeText">Witaj, Piotr</h2>
        <p>Zarządzaj swoimi biletami i rezerwacjami</p>
    </section>

   
    <section class="card-grid cashier-actions">

        
        <div class="card action-card" onclick="goToTickets()">
            <h3>Moje bilety</h3>
            <p>
                Zarządzanie biletami, zmiana miejsca,<br>
                rezygnacja z lotu
            </p>
        </div>

       
        <div class="card action-card" onclick="goToHistory()">
            <h3>Historia zakupów</h3>
            <p>
                Przegląd rezerwacji,<br>
                płatności i faktur
            </p>
        </div>

        
        <div class="card action-card" onclick="goToSearch()">
            <h3>Zarezerwuj nowy lot</h3>
            <p>
                Wyszukiwanie połączeń<br>
                i zakup biletu
            </p>
        </div>

    </section>



</main>

<script src="/js/app.js"></script>
<script src="/js/client.js"></script>
<script>
    checkSession(['CLIENT']);
</script>

</body>
</html>

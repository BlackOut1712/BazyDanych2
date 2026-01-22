<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <title>Moje bilety</title>
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

        <button class="btn-secondary" onclick="goBack()">
            ⬅ Wróć do panelu
        </button>

        <button class="btn-secondary" onclick="logout()">Wyloguj</button>
    </div>
</header>

<main class="container tickets-page">


    <section class="card tickets-management">

        <!-- HEADER -->
        <div class="tickets-header-block">
            <h2>Moje bilety</h2>
            <p>Zarządzanie biletami, zmiana miejsca i rezygnacja z lotu</p>
        </div>

        <!-- TABELA -->
        <div class="table-wrapper">
            <table class="styled-table tickets-table">
                <thead>
                    <tr>
                        <th class="col-number">Numer biletu</th>
                        <th class="col-route">Trasa</th>
                        <th class="col-date">Data i godzina</th>
                        <th class="col-status">Status</th>
                        <th class="col-actions">Akcje</th>
                    </tr>
                </thead>

                <tbody id="tickets-container">
                    <tr>
                        <td colspan="5" class="table-loading">
                             Ładowanie biletów...
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

    </section>

</main>

<script src="/js/app.js"></script>
<script src="/js/tickets.js"></script>

<script>
function goBack() {
    window.location.href = '/client/dashboard';
}
</script>

</body>
</html>

<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <title>Zarządzanie biletami</title>

    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <link rel="stylesheet" href="/css/style.css">

    <!-- SESJA -->
    <script src="/js/session.js"></script>
    <script>
        checkSession(['KASJER']);
    </script>
</head>
<body>

<!-- =========================
     TOP BAR
========================= -->
<header class="top-bar">
    <div class="logo">Lotnisko</div>

    <div class="actions">
        <button type="button" class="btn-secondary" onclick="goBack()">
            ⬅ Wróć do panelu kasjera
        </button>
        <button
            type="button"
            class="btn-secondary"
            onclick="logout()"
        >
            Wyloguj
        </button>
    </div>
</header>

<!-- =========================
     CONTENT
========================= -->
<main class="container">

    <section class="card tickets-management">

        <h2>Zarządzanie biletami</h2>

        <p class="subtitle">
            Zwroty, zmiana miejsca, anulowanie rezerwacji oraz faktury
        </p>

        <!-- =========================
             TABELA BILETÓW
        ========================== -->
        <div class="table-wrapper">
            <table class="styled-table">
                <thead>
                    <tr>
                        <th>Numer biletu</th>
                        <th>Pasażer</th>
                        <th>Lot</th>
                        <th>Miejsce</th>
                        <th>Status</th>
                        <th>Akcje</th>
                    </tr>
                </thead>

                <tbody id="ticketsBody">
                    <tr>
                        <td colspan="6" class="table-loading">
                            ⏳ Ładowanie biletów...
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        

    </section>

</main>

<!-- =========================
     SCRIPTS
========================= -->
<script src="/js/app.js"></script>
<script src="/js/cashier-tickets.js"></script>

<script>
    function goBack() {
        window.location.href = '/cashier/dashboard';
    }
</script>

</body>
</html>

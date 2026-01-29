<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <title>Historia zakupów</title>

    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <link rel="stylesheet" href="/css/style.css">
    <link rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

    
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
        <button
            type="button"
            class="btn-secondary"
            onclick="goBack()"
        >
            ⬅ Wróć do panelu klienta
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


<main class="container">

    <section class="card tickets-management">

        <h2>Historia zakupów</h2>

        <p class="subtitle">
            Przegląd Twoich biletów, płatności oraz faktur
        </p>

  
        <div class="table-wrapper">
            <table class="styled-table">
                <thead>
                    <tr>
                        <th>ID biletu</th>
                        <th>Trasa</th>
                        <th>Data i godzina</th>
                        <th>Status</th>
                        <th>Faktura</th>
                    </tr>
                </thead>

                <tbody id="tickets-container">
                    <tr>
                        <td colspan="5" class="table-loading">
                            ⏳ Ładowanie biletów...
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="actions">
            
        </div>

    </section>

</main>


<script src="/js/app.js"></script>
<script src="/js/history.js"></script>

<script>
    function goBack() {
        window.location.href = '/client/dashboard';
    }
</script>

</body>
</html>

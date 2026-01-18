<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <title>Zarządzanie pracownikami</title>
    <link rel="stylesheet" href="/css/style.css">

    <!-- SESJA -->
    <script src="/js/session.js"></script>
    <script>
        checkSession(['MENADZER']);
    </script>
</head>
<body class="workers-page">

<!-- GÓRNY PASEK -->
<header class="top-bar">
    <div class="logo">Lotnisko</div>
    <nav class="top-actions">
        
        <button class="btn-secondary" onclick="goBack()">
            ← Wróć do panelu menadżera
        </button>
        <button class="btn-secondary" onclick="logout()">Wyloguj</button>
    </nav>
</header>

<!-- ZAWARTOŚĆ -->
<main class="container">

    <!-- NAGŁÓWEK -->
    <section class="card card-header">
        <h2>Zarządzanie pracownikami</h2>
        <p>Dodawanie, edycja oraz blokowanie kont pracowników</p>
    

    <!-- LISTA PRACOWNIKÓW -->
    
        <h3>Lista pracowników</h3>

        <div class="table-wrapper">
            <table class="employees-table">
                <thead>
                    <tr>
                        <th>Imię</th>
                        <th>Nazwisko</th>
                        <th>Login</th>
                        <th>Rola</th>
                        <th>Status</th>
                        <th>Akcje</th>
                    </tr>
                </thead>
                <tbody id="workersBody">
                    <tr>
                        <td colspan="6" class="table-loading">Ładowanie danych…</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </section>

    <!-- FORMULARZ -->
    <section class="card">
        <h3 id="formTitle">Dodaj pracownika</h3>

        <div class="form-grid">
            <input type="text" id="imie" placeholder="Imię">
            <input type="text" id="nazwisko" placeholder="Nazwisko">
            <input type="text" id="pesel" placeholder="PESEL">
            <input type="text" id="adres" placeholder="Adres">
            <input type="text" id="telefon" placeholder="Telefon">
            <input type="email" id="email" placeholder="Email">
            <input type="text" id="login" placeholder="Login">
            <input type="password" id="haslo" placeholder="Hasło (puste = bez zmiany)">

            <select id="rola">
                <option value="KASJER">Kasjer</option>
                <option value="MENADZER">Menadżer</option>
            </select>

            
        </div>

        <div class="actions">
            <button class="btn-primary" onclick="saveWorker()">Zapisz</button>
            <button class="btn-secondary" onclick="resetForm()">Wyczyść</button>
        </div>

        <div id="formResult" class="form-result"></div>
    </section>


    

</main>


<script src="/js/app.js"></script>
<script src="/js/workers.js"></script>

</body>
</html>

<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <title>Logowanie</title>
    <link rel="stylesheet" href="/css/style.css">
</head>
<body>

<header class="top-bar">
    <div class="logo"><a href="/index">Lotnisko</a></div>
    <div class="top-actions">
        <a href="/register">Zarejestruj się</a>
        <a href="/login">Zaloguj się</a>
    </div>
</header>

<main class="login-page">
    <div class="login-card">
        <h2>Witaj ponownie!</h2>

        <input type="text" id="identifier" placeholder="Adres e-mail / login">
        <input type="password" id="secret" placeholder="6-cyfrowy PIN / hasło">

        <label class="remember">
            <input type="checkbox" id="remember">
            Zapamiętaj mnie
        </label>

        <button onclick="login()">Zaloguj się</button>

        <p class="register">
            Nie masz konta? <a href="/register">Zarejestruj się</a>
        </p>
    </div>
</main>

<script src="/js/auth.js"></script>
</body>
</html>

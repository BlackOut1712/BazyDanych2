<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <title>Rejestracja</title>
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

<main class="register-page">

    <div class="register-card">
        <h2>Załóż konto</h2>

        <h4>Dane osobowe</h4>
        <input type="text" id="imie" placeholder="Imię">
        <input type="text" id="nazwisko" placeholder="Nazwisko">
        <input 
            type="text" 
            id="pesel" 
            placeholder="PESEL"
            maxlength="11"
            inputmode="numeric"
            oninput="this.value = this.value.replace(/[^0-9]/g, '')"
        >

        <h4>Dane logowania</h4>
        <input type="email" id="email" placeholder="Adres e-mail">
        <input 
            type="tel" 
            id="telefon" 
            placeholder="Numer telefonu"
            maxlength="9"
            inputmode="numeric"
            oninput="this.value = this.value.replace(/[^0-9]/g, '')"
        >
        <input type="password" id="pin" placeholder="6-cyfrowy PIN">
        <input type="password" id="pin2" placeholder="Powtórz 6-cyfrowy PIN">

        <label class="remember">
            <input type="checkbox" id="terms">
            <span>
                Akceptuję
                <a href="regulamin.txt"
                download="Regulamin_Serwisu_Lotnisko.txt">
                    regulamin
                </a>.
            </span>
        </label>

        <button onclick="register()">Zarejestruj się</button>

        <p class="small">
            Masz już konto? <a href="/login">Zaloguj się</a>
        </p>
    </div>

</main>

<script src="/js/register.js"></script>
</body>
</html>

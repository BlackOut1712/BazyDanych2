<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <title>Płatność BLIK</title>

    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    {{-- CSS --}}
    <link rel="stylesheet" href="/css/style.css">

    {{-- SESJA --}}
    <script src="/js/session.js"></script>
    <script>
        // 🔒 TYLKO KLIENT
        checkSession(['CLIENT']);
    </script>
</head>
<body class="blik-page">



<div class="blik-container">
    <div class="blik-card">

        <h3 class="blik-title">Podaj kod BLIK</h3>

        <p class="blik-subtitle">
            Wpisz 6-cyfrowy kod wygenerowany w aplikacji banku
        </p>

        <input
            type="text"
            id="blikCode"
            class="blik-input"
            placeholder="______"
            maxlength="6"
            inputmode="numeric"
            autocomplete="one-time-code"
        />

        <button
            class="btn-primary blik-btn"
            onclick="payBlik()"
        >
            💳 Zapłać
        </button>

        <div id="blikResult" class="blik-result"></div>

    </div>
</div>

{{-- JS --}}
<script src="/js/app.js"></script>
<script src="/js/blik-client.js"></script>

</body>
</html>

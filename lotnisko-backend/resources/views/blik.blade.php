<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <title>Płatność BLIK</title>

    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    {{-- TWÓJ CSS --}}
    <link rel="stylesheet" href="/css/style.css">

    {{-- SESJA --}}
    <script src="/js/session.js"></script>
    <script>
        checkSession(['KASJER', 'MENADZER', 'CLIENT']);
    </script>
</head>
<body class="blik-page">

<div class="blik-container">
    <div class="blik-card">
        <h3 class="blik-title">Podaj kod BLIK</h3>

        <input
            type="text"
            id="blikCode"
            class="blik-input"
            placeholder="______"
            maxlength="6"
            inputmode="numeric"
        />

        <button class="btn-primary blik-btn" onclick="payBlik()">
            Zapłać
        </button>

        <div id="blikResult" class="blik-result"></div>
    </div>
</div>

<script src="/js/blik.js"></script>
</body>
</html>

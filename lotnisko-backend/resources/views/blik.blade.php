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
        // 🔐 dostęp tylko dla zalogowanych
        checkSession(['KASJER', 'MENADZER', 'CLIENT']);
    </script>
</head>
<body class="blik-page">

<div class="blik-container">
    <div class="blik-card">

        <h3 class="blik-title">Podaj kod BLIK</h3>

        {{-- 🔢 KOD BLIK --}}
        <input
            type="text"
            id="blikCode"
            class="blik-input"
            placeholder="______"
            maxlength="6"
            inputmode="numeric"
            autocomplete="one-time-code"
        />

        {{-- ▶️ ZAPŁAĆ --}}
        <button
            type="button"
            class="btn-primary blik-btn"
            onclick="payBlik()"
        >
            Zapłać
        </button>

        {{-- ℹ️ WYNIK --}}
        <div id="blikResult" class="blik-result"></div>

    </div>
</div>

{{-- 🔧 APP (apiFetch, nagłówki, sesja) --}}
<script src="/js/app.js"></script>

{{-- 💳 LOGIKA BLIK --}}
<script src="/js/blik.js"></script>

</body>
</html>

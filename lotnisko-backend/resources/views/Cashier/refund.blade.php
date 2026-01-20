<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <title>Zwrot BLIK – Kasjer</title>

    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!-- CSS -->
    <link rel="stylesheet" href="/css/style.css">

    <!-- SESJA -->
    <script src="/js/session.js"></script>
    <script>
        checkSession(['KASJER']);
    </script>
</head>

<body class="refund-page">

<div class="blik-container">

    <div class="blik-card">

        <h3 class="blik-title">Zwrot środków (BLIK)</h3>

        <p class="blik-subtitle">
            Podaj numer telefonu klienta oraz PIN klienta
        </p>

        <input
            type="text"
            id="phoneNumber"
            class="phone-input"
            placeholder="Numer telefonu klienta"
            inputmode="numeric"
            maxlength="11"
        />

        <input
            type="password"
            id="clientPin"
            class="blik-input"
            placeholder="PIN klienta (6 cyfry)"
            maxlength="6"
            inputmode="numeric"
            autocomplete="one-time-code"
        />

        <button
            class="btn-primary blik-btn"
            onclick="refundBlikCashier()"
        >
            💸 Wykonaj zwrot
        </button>

        <div id="refundResult" class="blik-result"></div>

    </div>

</div>

<!-- JS -->
<script src="/js/app.js"></script>
<script src="/js/refund-cashier.js"></script>

</body>
</html>

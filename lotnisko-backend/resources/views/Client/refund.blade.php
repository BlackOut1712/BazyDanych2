<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <title>Zwrot BLIK</title>

    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    
    <link rel="stylesheet" href="/css/style.css">

    
    <script src="/js/session.js"></script>
    <script>
        checkSession(['CLIENT']);
    </script>
</head>

<body class="refund-page">


<div class="blik-container">

    <div class="blik-card">

        <h3 class="blik-title">Zwrot środków (BLIK)</h3>

        <p class="blik-subtitle">
            Podaj numer telefonu oraz kod BLIK do zwrotu
        </p>

        <input
            type="text"
            id="phoneNumber"
            class="phone-input"
            placeholder="Numer telefonu"
            inputmode="numeric"
            maxlength="11"
        />

        <input
            type="password"
            id="blikCode"
            class="blik-input"
            placeholder="Pin"
            maxlength="6"
            inputmode="numeric"
            autocomplete="one-time-code"
        />

        <button
            class="btn-primary blik-btn"
            onclick="refundBlik()"
        >
             Wykonaj zwrot
        </button>

        <div id="refundResult" class="blik-result"></div>

    </div>

</div>

<script src="/js/app.js"></script>
<script src="/js/refund-client.js"></script>

</body>
</html>

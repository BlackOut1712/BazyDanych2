<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Rezerwacja miejsca</title>
    <link rel="stylesheet" href="/css/style.css">

    <!-- SESJA -->
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
        <button class="btn-secondary" onclick="logout()">Wyloguj</button>
    </div>
</header>

<main class="container">
<section class="card sell-card">

    <h2>Rezerwacja miejsca</h2>
    <p class="subtitle">
        Wybierz miejsce i podaj dane pasażera
    </p>

    <!-- =========================
         FORMULARZ PASAŻERA
    ========================== -->
    <div class="sell-form">

        <div class="form-row">
            <label for="passengerFirstName">Imię pasażera</label>
            <input
                type="text"
                id="passengerFirstName"
                placeholder="np. Anna"
                data-autofill="imie"
                autocomplete="given-name"   
            >
        </div>

        <div class="form-row">
            <label for="passengerLastName">Nazwisko pasażera</label>
            <input
                type="text"
                id="passengerLastName"
                placeholder="np. Kowalska"
                data-autofill="nazwisko"
                autocomplete="family-name" 
            >
        </div>

        <div class="form-row">
            <label for="passengerPesel">PESEL pasażera</label>
            <input
                type="text"
                id="passengerPesel"
                placeholder="11 cyfr"
                maxlength="11"
                data-autofill="pesel"
                inputmode="numeric"         
            >
        </div>

        <!-- 🔥 NOWE: informacja o autofill -->
        <div class="form-hint">
            Jeśli pola pozostaną puste, system automatycznie użyje danych z Twojego konta.
        </div>

        <!-- 🔥 DODANE (NIEINWAZYJNE): znacznik dla JS -->
        <div id="autofill-ready" data-enabled="true" style="display:none"></div>

    </div>

    <!-- =========================
         UKŁAD MIEJSC
    ========================== -->
    <div class="seat-layout">

        <!-- SAMOLOT -->
        <div class="plane plane-svg">

            <svg class="plane-body" viewBox="0 0 300 1100" preserveAspectRatio="none">
                <path d="
                    M150 0
                    C80 50, 40 140, 40 240
                    L40 960
                    C40 1040, 260 1040, 260 960
                    L260 240
                    C260 140, 220 50, 150 0
                    Z"
                    fill="#f3f4f6"
                    stroke="#d1d5db"
                    stroke-width="4"
                />
            </svg>

            <div class="plane-content">

                <div id="seatMap" class="seat-map-grid"></div>

                <div class="seat-legend">
                    <span><span class="legend-box legend-economy"></span> Economy</span>
                    <span><span class="legend-box legend-business"></span> Business</span>
                    <span><span class="legend-box" style="background:#9ca3af"></span> Zajęte</span>
                    <span><span class="legend-box legend-selected"></span> Wybrane</span>
                </div>

            </div>
        </div>

        <!-- =========================
             PODSUMOWANIE
        ========================== -->
        <div class="summary-card">

            <h3>Podsumowanie</h3>

            <p>
                <b>Lot:</b>
                <span id="summaryLot">—</span>
            </p>

            <p>
                <b>Miejsce:</b>
                <span id="summarySeat">—</span>
            </p>

            <p>
                <b>Klasa:</b>
                <span id="summaryClass">—</span>
            </p>

            <p>
                <b>Imię pasażera:</b>
                <span id="summaryPassengerFirstName">—</span>
            </p>

            <p>
                <b>Nazwisko pasażera:</b>
                <span id="summaryPassengerLastName">—</span>
            </p>

            <p>
                <b>PESEL pasażera:</b>
                <span id="summaryPassengerPesel">—</span>
            </p>

            <p>
                <b>Cena:</b>
                <span id="summaryPrice">—</span> zł
            </p>

            <button
                id="reserveBtn"
                class="btn-primary"
                disabled
                onclick="reserveSeat()"
            >
                💳 Przejdź do płatności
            </button>

        </div>

    </div>

    <div id="reserveResult" class="form-result"></div>

</section>
</main>

<!-- JS -->
<script src="/js/app.js"></script>
<script src="/js/seats.js"></script>

</body>
</html>

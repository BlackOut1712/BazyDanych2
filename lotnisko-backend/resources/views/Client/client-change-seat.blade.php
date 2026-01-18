<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <title>Zmiana miejsca</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <link rel="stylesheet" href="/css/style.css">

    <!-- SESJA -->
    <script src="/js/session.js"></script>
    <script>
        checkSession(['CLIENT']);
    </script>
</head>
<body>

<header class="top-bar">
    <div class="logo">Lotnisko</div>
    <div class="actions">
        <button class="btn-secondary" onclick="logout()">Wyloguj</button>
    </div>
</header>

<main class="container">
<section class="card sell-card">

    <h2>Zmiana zarezerwowanego miejsca</h2>
    <p class="subtitle">
        Wybierz nowe miejsce w samolocie
    </p>

    <div class="seat-layout">

        <!-- SAMOLOT – 1:1 JAK KASJER -->
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
                </div>
            </div>
        </div>

        <!-- PANEL BOCZNY -->
        <div class="summary-card">
            <h3>Informacje o bilecie</h3>

            <div id="ticketInfo" class="summary-data">
                ⏳ Ładowanie danych biletu...
            </div>

            <button
                type="button"
                class="btn-primary"
                onclick="confirmSeatChange()"
            >
                ✔ Zapisz zmianę
            </button>

            <button
                type="button"
                class="btn-secondary"
                onclick="goBack()"
                style="margin-top: 12px;"
            >
                ⬅ Anuluj
            </button>
        </div>

    </div>

</section>
</main>

<script src="/js/app.js"></script>
<script src="/js/client-change-seat.js"></script>

<script>
function goBack() {
    window.location.href = '/client/tickets';
}
</script>

</body>
</html>

<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Sprzedaż biletu</title>
    <link rel="stylesheet" href="/css/style.css">

  
    <script src="/js/session.js"></script>
    <script>
        checkSession(['KASJER', 'MENADZER']);
    </script>
</head>
<body>

<header class="top-bar">
    <div class="logo">
        <a href="/cashier/dashboard">Lotnisko</a>
    </div>
    <div class="top-actions">
        <button type="button" class="btn-secondary" onclick="goBack()">
            ⬅ Wróć do panelu kasjera
        </button>
        <button class="btn-secondary" onclick="logout()">Wyloguj</button>
    </div>
</header>

<main class="container">
<section class="card sell-card">

    <h2>Sprzedaż biletu</h2>
    <p class="subtitle">
        Wybierz klienta, pasażera, lot oraz miejsce
    </p>

    <div class="sell-form">

        
        <div class="form-row">
            <label for="klientSelect">Klient (kupujący)</label>
            <select id="klientSelect">
                <option value="">-- wybierz klienta --</option>
            </select>
        </div>

        
        <div class="form-row">
            <label for="passengerFirstName">Imię pasażera</label>
            <input type="text" id="passengerFirstName" placeholder="np. Anna">
        </div>

        <div class="form-row">
            <label for="passengerLastName">Nazwisko pasażera</label>
            <input type="text" id="passengerLastName" placeholder="np. Kowalska">
        </div>

        <div class="form-row">
            <label for="passengerPesel">PESEL pasażera</label>
            <input type="text" id="passengerPesel" placeholder="11 cyfr" maxlength="11">
        </div>

       
        <div class="form-row">
            <label for="lotSelect">Lot</label>
            <select id="lotSelect">
                <option value="">-- wybierz lot --</option>
            </select>
        </div>

        
        <div class="seat-layout">

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

            <div class="summary-card">
                <h3>Podsumowanie</h3>

                <p><b>Klient:</b> <span id="summaryClient">—</span></p>
                <p><b>Lot:</b> <span id="summaryLot">—</span></p>
                <p><b>Miejsce:</b> <span id="summarySeat">—</span></p>
                <p><b>Cena:</b> <span id="summaryPrice">—</span> zł</p>

                <button type="button" class="btn-primary" onclick="sellTicket()">
                    💳 Przejdź do płatności
                </button>
            </div>

        </div>

        
        <div class="form-row">
            <label for="miejsceSelect">Miejsce (lista)</label>
            <select id="miejsceSelect" disabled>
                <option value="">-- wybierz miejsce --</option>
            </select>
        </div>

        
        <div class="form-row">
            <label for="priceInput">Cena biletu (zł)</label>
            <input
                type="number"
                id="priceInput"
                readonly
                disabled
                style="background:#f3f4f6; cursor:not-allowed;"
            >
        </div>

      
        

        <div id="sellResult" class="form-result"></div>

    </div>
</section>
</main>

<script src="/js/app.js"></script>
<script src="/js/cashier-sell.js"></script>

<script>
function goBack() {
    window.location.href = '/cashier/dashboard';
}
</script>

</body>
</html>

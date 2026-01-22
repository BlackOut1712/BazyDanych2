<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <title>Loty</title>
    <link rel="stylesheet" href="/css/style.css">
</head>
<body class="loty">

<header class="top-bar">
    <div class="logo">
        <a href="/cashier/dashboard">Lotnisko</a>
    </div>
    <div class="top-actions">
        <button class="btn-secondary" onclick="goBack()">
            ← Wróć do panelu menadżera
        </button>
        <button class="btn-secondary" onclick="logout()">Wyloguj</button>
    </div>
</header>

<main class="container">

    <!-- LISTA LOTÓW -->
    <section class="card">
        <h2>Loty</h2>

        <div class="table-wrapper">
            <table class="employees-table">
                <thead>
                    <tr>
                        <th>Trasa</th>
                        <th>Data</th>
                        <th>Godzina</th>
                        <th>Ceny</th>
                        <th>Status</th>
                        <th style="width:120px; text-align:center;">Akcje</th>
                    </tr>
                </thead>
                <tbody id="flightsBody">
                    <tr>
                        <td colspan="6" class="table-loading">Ładowanie...</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="actions">
            <button class="btn-primary" onclick="addFlight()">+ Dodaj lot</button>
            
        </div>
    </section>

    <!-- DODAWANIE / EDYCJA LOTU -->
    <section class="card" id="flightFormSection" style="display:none;">
        <h2 id="flightFormTitle">Dodaj lot</h2>

        <input type="hidden" id="flightId">

        <div class="form-grid">
            <input type="text" id="fromCity" placeholder="Miasto wylotu">
            <input type="text" id="fromCountry" placeholder="Kraj wylotu">

            <input type="text" id="toCity" placeholder="Miasto przylotu">
            <input type="text" id="toCountry" placeholder="Kraj przylotu">

            <input type="date" id="data">
            <input type="time" id="godzina">

            <select id="samolotSelect">
                <option value="">-- wybierz samolot --</option>
            </select>

            <select id="status">
                <option value="AKTYWNY">Aktywny</option>
                <option value="NIEAKTYWNY">Nieaktywny</option>
            </select>

            <!-- ZAKRES CEN (EKONOMICZNA / BIZNES) -->
            <select id="priceRange">
                <option value="">-- wybierz zakres cen (EKO / BUS) --</option>
                <option value="250|500">Ekonomiczna 250 zł / Biznes 500 zł</option>
                <option value="350|700">Ekonomiczna 350 zł / Biznes 700 zł</option>
                <option value="500|1000">Ekonomiczna 500 zł / Biznes 1000 zł</option>
                <option value="1000|2000">Ekonomiczna 1000 zł / Biznes 2000 zł</option>
                <option value="2000|4000">Ekonomiczna 2000 zł / Biznes 4000 zł</option>
                <option value="4000|8000">Ekonomiczna 4000 zł / Biznes 8000 zł</option>
            </select>
        </div>

        <div class="actions">
            <button class="btn-primary" onclick="saveFlight()">Zapisz</button>
            <button class="btn-secondary" onclick="hideFlightForm()">Anuluj</button>
        </div>

        <div id="flightResult"></div>
    </section>

</main>

<script src="/js/session.js"></script>
<script src="/js/app.js"></script>
<script src="/js/flights.js"></script>
<script>
    function goBack() {
        window.location.href = '/admin/dashboard';
    }
</script>

</body>
</html>

<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <title>Mój profil</title>
    <link rel="stylesheet" href="/css/style.css">

    <script src="/js/session.js"></script>
    <script>
        checkSession(['CLIENT']);
    </script>
</head>
<body>

<!-- TOP BAR -->
<header class="top-bar">
    <div class="logo">
        <a href="/client/dashboard">Lotnisko</a>
    </div>

    <div class="top-actions">
        <span class="role-label">Klient</span>
        <button class="btn-secondary" onclick="window.location.href='/client/dashboard'">
            Powrót do panelu
        </button>
        <button class="btn-secondary" onclick="logout()">Wyloguj</button>
    </div>
</header>


<main class="container">

    
    <section class="card card-header">
        <h2>Mój profil</h2>
        <p>Zarządzaj swoimi danymi kontaktowymi i hasłem</p>
    </section>

    
    <div class="profile-grid">

        
        <div class="card profile-card">
            <h3>Dane użytkownika</h3>

            <form id="profileForm">
                <div class="form-group">
                    <label for="imie">Imię</label>
                    <input type="text" id="imie" disabled>
                </div>

                <div class="form-group">
                    <label for="nazwisko">Nazwisko</label>
                    <input type="text" id="nazwisko" disabled>
                </div>

                <div class="form-group">
                    <label for="pesel">PESEL</label>
                    <input type="text" id="pesel" disabled>
                </div>

                <div class="form-group">
                    <label for="email">Adres e-mail</label>
                    <input type="email" id="email">
                </div>

                <div class="form-group">
                    <label for="numer_telefonu">Numer telefonu</label>
                    <input type="text" id="numer_telefonu">
                </div>

                <button type="submit" class="btn-primary">
                    Zapisz zmiany
                </button>
            </form>
        </div>

        
        <div class="card profile-card">
                <h3>Zmiana PIN-u</h3>

                <form id="passwordForm">

                    <div class="form-group">
                        <label for="current_password">Aktualny PIN</label>
                        <input
                            type="password"
                            id="current_password"
                            inputmode="numeric"
                            pattern="\d{6}"
                            minlength="6"
                            maxlength="6"
                            autocomplete="off"
                            required
                        >
                    </div>

                    <div class="form-group">
                        <label for="new_password">Nowy PIN</label>
                        <input
                            type="password"
                            id="new_password"
                            inputmode="numeric"
                            pattern="\d{6}"
                            minlength="6"
                            maxlength="6"
                            autocomplete="off"
                            required
                        >
                    </div>

                    <div class="form-group">
                        <label for="new_password_confirm">Powtórz nowy PIN</label>
                        <input
                            type="password"
                            id="new_password_confirm"
                            inputmode="numeric"
                            pattern="\d{6}"
                            minlength="6"
                            maxlength="6"
                            autocomplete="off"
                            required
                        >
                    </div>

                    <button type="submit" class="btn-danger">
                        Zmień PIN
                    </button>
                </form>
            </div>

        </form>
    </div>

</div>

</main>

<script src="/js/app.js"></script>
<script src="/js/profile.js"></script>

</body>
</html>

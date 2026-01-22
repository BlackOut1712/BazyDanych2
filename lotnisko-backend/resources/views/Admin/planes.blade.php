<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <title>Samoloty</title>
    <link rel="stylesheet" href="/css/style.css">
</head>
<body class="samoloty">

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

    <!-- LISTA SAMOLOTÓW -->
    <section class="card">
        <h2>Samoloty</h2>

        <div class="table-wrapper">
            <table class="employees-table">
                <thead>
                    <tr>
                        <th>Model</th>
                        <th>Liczba miejsc</th>
                        <th>Status</th>
                        <th style="width:120px; text-align:center;">Akcje</th>
                    </tr>
                </thead>
                <tbody id="planesBody">
                    <tr>
                        <td colspan="4" class="table-loading">Ładowanie...</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="actions">
            <button class="btn-primary" onclick="showAddPlaneForm()">
                + Dodaj samolot
            </button>

            
        </div>
    </section>

    <!-- FORMULARZ DODAWANIA / EDYCJI -->
    <section class="card" id="addPlaneSection" style="display:none;">
        <h2 id="planeFormTitle">Dodaj samolot</h2>

        <input type="hidden" id="planeId">

        <div class="form-grid">

            <div class="form-group">
                <input
                    type="text"
                    id="model"
                    placeholder="Model (np. Boeing 737)"
                >
            </div>

            <div class="form-group">
                <select id="liczba_miejsc">
                    <option value="">-- liczba miejsc --</option>
                    <option value="90">90 (15 rzędów, 3+3)</option>
                    <option value="120">120 (20 rzędów, 3+3)</option>
                    <option value="150">150 (25 rzędów, 3+3)</option>
                    <option value="180">180 (30 rzędów, 3+3)</option>
                </select>
            </div>

            <div class="form-group">
                <select id="status">
                    <option value="AKTYWNY">Aktywny</option>
                    <option value="NIEAKTYWNY">Nieaktywny</option>
                </select>
            </div>

        </div>

        <div class="actions">
            <button class="btn-primary" onclick="savePlane()">
                Zapisz
            </button>

            <button class="btn-secondary" onclick="hideAddPlaneForm()">
                Anuluj
            </button>
        </div>

        <div id="planeResult" class="form-result"></div>
    </section>

</main>

<script src="/js/session.js"></script>
<script src="/js/app.js"></script>
<script src="/js/planes.js"></script>

<script>
    checkSession(['MENADZER']);

    function goBack() {
        window.location.href = '/admin/dashboard';
    }

    function showAddPlaneForm() {
        document.getElementById('planeFormTitle').innerText = 'Dodaj samolot';
        document.getElementById('planeId').value = '';
        document.getElementById('model').value = '';
        document.getElementById('liczba_miejsc').value = '';
        document.getElementById('status').value = 'AKTYWNY';
        document.getElementById('planeResult').innerHTML = '';

        document.getElementById('addPlaneSection').style.display = 'block';
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }

    function hideAddPlaneForm() {
        document.getElementById('addPlaneSection').style.display = 'none';
    }
</script>

</body>
</html>

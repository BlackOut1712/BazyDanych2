<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <style>
        body {
            font-family: DejaVu Sans;
            font-size: 12px;
        }
        h1 {
            text-align: center;
        }
        .section {
            margin-bottom: 20px;
        }
        .row {
            display: flex;
            justify-content: space-between;
        }
        .box {
            border: 1px solid #ccc;
            padding: 10px;
        }
    </style>
</head>
<body>

<h1>FAKTURA</h1>

<div class="section">
    <div class="row">
        <div>Numer: <b>{{ $numer_faktury }}</b></div>
        <div>Data: {{ $data }}</div>
    </div>
</div>

<div class="section box">
    <b>Sprzedawca</b><br>
    Lotnisko XYZ<br>
    ul. Przykładowa 1<br>
</div>

<div class="section box">
    <b>Nabywca</b><br>
    {{ $klient->imie ?? '—' }} {{ $klient->nazwisko ?? '—' }}<br>
    PESEL: {{ $klient->pesel ?? '—' }}
</div>

<div class="section box">
    <b>Usługa</b><br>
    Bilet lotniczy<br>

    Trasa:
    {{ $trasa?->lotniskoWylotu?->miasto ?? '—' }}
    →
    {{ $trasa?->lotniskoPrzylotu?->miasto ?? '—' }}<br>

    
</div>

<div class="section box">
    <b>Kwota:</b> {{ $kwota }} zł
</div>

</body>
</html>

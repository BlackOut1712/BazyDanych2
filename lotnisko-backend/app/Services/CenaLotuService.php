<?php

namespace App\Services;

use App\Models\Lot;
use App\Models\Bilet;

class CenaLotuService
{
    public static function policz(Lot $lot, string $klasa): float
    {
        // 1️⃣ MAPOWANIE KLASY Z MIEJSCA → KLASY W BAZIE
        $mapaKlas = [
            'ECO' => 'ECONOMY',
            'BUS' => 'BUSINESS',
        ];

        $klasa = strtoupper($klasa);
        $dbKlasa = $mapaKlas[$klasa] ?? null;

        if (!$dbKlasa) {
            return 0.0;
        }

        // 2️⃣ CENA BAZOWA Z lot_ceny
        $cenaBazowa = $lot->ceny()
            ->where('klasa', $dbKlasa)
            ->value('cena');

        if ($cenaBazowa === null) {
            return 0.0;
        }

        // 3️⃣ SPRZEDANE MIEJSCA
        $sprzedane = Bilet::where('lot_id', $lot->id)->count();
        $wszystkie = $lot->samolot->liczba_miejsc ?? 0;

        if ($wszystkie === 0) {
            return (float) $cenaBazowa;
        }

        $soldRatio = $sprzedane / $wszystkie;

        // 4️⃣ OKNO CZASOWE (DATA + GODZINA LOTU)
        $dataLotu = \Carbon\Carbon::parse(
            $lot->data . ' ' . $lot->godzina
        );

        $godzinyDoOdlotu = now()->diffInHours($dataLotu, false);
        $maxOkno = 168; // 7 dni

        $timeRatio = $godzinyDoOdlotu > 0
            ? max(0, 1 - ($godzinyDoOdlotu / $maxOkno))
            : 1;

        // 5️⃣ LITTLE (PODAŻ × CZAS)
        $little = $soldRatio * $timeRatio;

        // 6️⃣ CENA KOŃCOWA
        return round($cenaBazowa * (1 + $little), 2);
    }
}

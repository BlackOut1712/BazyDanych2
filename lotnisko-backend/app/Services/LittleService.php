<?php

namespace App\Services;

use App\Models\Lot;
use App\Models\Rezerwacja;
use Carbon\Carbon;

class LittleService
{
    public function obliczWspolczynnik(Lot $lot): float
    {
        // 🔹 liczba miejsc
        $liczbaMiejsc = $lot->miejsca()->count();

        // 🔹 aktywne rezerwacje
        $zajete = Rezerwacja::whereIn('status', ['OCZEKUJE', 'POTWIERDZONA'])
            ->whereHas('miejsce', fn ($q) => $q->where('lot_id', $lot->id))
            ->count();

        if ($liczbaMiejsc === 0) {
            return 1.0;
        }

        // 🔹 procent obłożenia
        $oblozenie = $zajete / $liczbaMiejsc;

        // 🔹 czas do odlotu (godziny)
        $godzinyDoLotu = Carbon::now()->diffInHours(
            Carbon::parse($lot->data)
                ->setTimeFromTimeString($lot->godzina),
            false
        );


        // 🔹 mnożnik czasu
        $czasowy = match (true) {
            $godzinyDoLotu < 24 => 1.4,
            $godzinyDoLotu < 72 => 1.2,
            default => 1.0,
        };

        // 🔹 końcowy współczynnik Little’a
        return round(1 + ($oblozenie * 0.8) * $czasowy, 2);
    }
}

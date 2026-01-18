<?php

namespace App\Http\Controllers;

use App\Models\Miejsce;
use App\Models\Lot;
use App\Models\Rezerwacja;
use Illuminate\Http\Request;

class MiejsceController extends Controller
{
    // POST /api/miejsca
    // Menadżer tworzy miejsca ręcznie dla KONKRETNEGO LOTU
    public function store(Request $request)
    {
        $data = $request->validate([
            'numer_miejsca' => 'required|string|max:5',
            'klasa'         => 'required|string|max:20',
            'okno'          => 'boolean',
            'przejscie'     => 'boolean',
            'lot_id'        => 'required|exists:lots,id',
        ]);

        return response()->json(
            Miejsce::create($data),
            201
        );
    }

    // GET /api/loty/{lot_id}/miejsca
    public function miejscaDlaLotu($lot_id)
    {
        $lot = Lot::findOrFail($lot_id);

        $miejsca = Miejsce::where('lot_id', $lot->id)
            ->with(['rezerwacja' => function ($q) {
                $q->whereIn('status', ['OCZEKUJE', 'POTWIERDZONA']);
            }])
            ->orderBy('numer_miejsca')
            ->get()
            ->map(function ($miejsce) {
                return [
                    'id'     => $miejsce->id,
                    'numer'  => $miejsce->numer_miejsca,
                    'klasa'  => $miejsce->klasa,
                    'zajete' => $miejsce->rezerwacja !== null,
                ];
            });

        return response()->json($miejsca);
    }
}

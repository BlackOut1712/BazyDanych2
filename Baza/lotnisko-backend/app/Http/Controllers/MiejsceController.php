<?php

namespace App\Http\Controllers;

use App\Models\Miejsce;
use Illuminate\Http\Request;

class MiejsceController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'numer' => 'required|string|max:5',
            'klasa' => 'required|string|max:20',
            'okno' => 'boolean',
            'przejscie' => 'boolean',
            'samolot_id' => 'required|exists:samolots,id'
        ]);

        return Miejsce::create($data);
    }
    public function miejscaDlaLotu($lot_id)
    {
        $lot = \App\Models\Lot::with('samolot')->findOrFail($lot_id);

        $miejsca = \App\Models\Miejsce::where('samolot_id', $lot->samolot_id)
            ->with(['rezerwacje' => function ($q) use ($lot_id) {
                $q->where('lot_id', $lot_id)
                ->whereIn('status', ['OCZEKUJE', 'POTWIERDZONA']);
            }])
            ->get()
            ->map(function ($miejsce) {
                return [
                    'id' => $miejsce->id,
                    'numer' => $miejsce->numer,
                    'klasa' => $miejsce->klasa,
                    'zajete' => $miejsce->rezerwacje->isNotEmpty(),
                ];
            });

        return response()->json($miejsca);
    }
}

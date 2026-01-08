<?php

namespace App\Http\Controllers;

use App\Models\Lot;
use App\Models\Miejsce;
use App\Models\Rezerwacja;
use Illuminate\Http\Request;

class LotController extends Controller
{
    // GET /api/loty
    public function index()
    {
        return response()->json(
            Lot::with([
                'trasa.lotniskoWylotu',
                'trasa.lotniskoPrzylotu'
            ])->get()
        );
    }

    // POST /api/loty
    public function store(Request $request)
    {
        $data = $request->validate([
            'data'     => 'required|date',
            'godzina'  => 'required',
            'status'   => 'nullable|string|max:20',
            'trasa_id' => 'required|exists:trasas,id',
        ]);

        $lot = Lot::create([
            'data'     => $data['data'],
            'godzina'  => $data['godzina'],
            'status'   => $data['status'] ?? 'AKTYWNY',
            'trasa_id' => $data['trasa_id'],
        ]);

        return response()->json($lot, 201);
    }

    // GET /api/loty/{id}
    public function show($id)
    {
        return response()->json(
            Lot::with('trasa')->findOrFail($id)
        );
    }

    // PUT /api/loty/{id}
    public function update(Request $request, $id)
    {
        $lot = Lot::findOrFail($id);

        $data = $request->validate([
            'data'     => 'sometimes|date',
            'godzina'  => 'sometimes',
            'status'   => 'sometimes|string|max:20',
            'trasa_id' => 'sometimes|exists:trasas,id',
        ]);

        $lot->update($data);

        return response()->json($lot);
    }

    // DELETE /api/loty/{id}
    public function destroy($id)
    {
        Lot::findOrFail($id)->delete();

        return response()->json([
            'message' => 'Lot usunięty'
        ]);
    }

    /* ======================================================
       ✅ NOWA METODA – BEZPIECZNE ROZSZERZENIE
       GET /api/loty/{id}/miejsca
       (zgodna z frontendem i UML)
    ====================================================== */
    public function dostepneMiejsca($id)
    {
        $lot = Lot::with('samolot')->findOrFail($id);

        // wszystkie miejsca danego samolotu
        $miejsca = Miejsce::where('samolot_id', $lot->samolot_id);

        // zajęte miejsca w tym locie
        $zajete = Rezerwacja::where('lot_id', $id)
            ->whereIn('status', ['OCZEKUJE', 'POTWIERDZONA'])
            ->pluck('miejsce_id');

        // tylko dostępne
        $dostepne = $miejsca
            ->whereNotIn('id', $zajete)
            ->orderBy('numer')
            ->get();

        return response()->json($dostepne);
    }
}

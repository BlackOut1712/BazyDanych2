<?php

namespace App\Http\Controllers;

use App\Models\Lot;
use App\Models\Miejsce;
use App\Models\Rezerwacja;
use App\Models\Samolot;
use App\Models\LotCena;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LotController extends Controller
{
    /* =========================
       GET /api/loty
       ➕ DOŁĄCZONE CENY + cena_od
    ========================= */
    public function index()
    {
        $loty = Lot::with([
            'trasa.lotniskoWylotu',
            'trasa.lotniskoPrzylotu',
            'samolot',
            'ceny'
        ])->get();

        // 🔥 DODANE – najniższa cena dla listy
        $loty->each(function ($lot) {
            $lot->cena = $lot->ceny->min('cena');
        });

        return response()->json($loty);
    }

    /* =========================
       POST /api/loty
       ➕ TWORZENIE LOTU + CEN
    ========================= */
    public function store(Request $request)
    {
        $data = $request->validate([
            'data'          => 'required|date',
            'godzina'       => 'required',
            'status'        => 'nullable|string|max:20',
            'trasa_id'      => 'required|exists:trasas,id',
            'samolot_id'    => 'required|exists:samolots,id',
            'cena_economy'  => 'required|numeric|min:0',
            'cena_business' => 'required|numeric|min:0',
        ]);

        return DB::transaction(function () use ($data) {

            $lot = Lot::create([
                'data'       => $data['data'],
                'godzina'    => $data['godzina'],
                'status'     => $data['status'] ?? 'AKTYWNY',
                'trasa_id'   => $data['trasa_id'],
                'samolot_id' => $data['samolot_id'],
            ]);

            LotCena::create([
                'lot_id' => $lot->id,
                'klasa'  => 'ECONOMY',
                'cena'   => $data['cena_economy'],
            ]);

            LotCena::create([
                'lot_id' => $lot->id,
                'klasa'  => 'BUSINESS',
                'cena'   => $data['cena_business'],
            ]);

            $samolot = Samolot::findOrFail($data['samolot_id']);
            $liczbaMiejsc = $samolot->liczba_miejsc;

            if ($liczbaMiejsc % 6 !== 0) {
                abort(500, 'Liczba miejsc w samolocie musi być podzielna przez 6');
            }

            $rzedy = $liczbaMiejsc / 6;

            $uklad = [
                ['A', true,  false],
                ['B', false, false],
                ['C', false, true],
                ['D', false, true],
                ['E', false, false],
                ['F', true,  false],
            ];

            for ($r = 1; $r <= $rzedy; $r++) {
                foreach ($uklad as [$litera, $okno, $przejscie]) {
                    Miejsce::create([
                        'numer_miejsca' => $r . $litera,
                        'klasa'         => $r <= 3 ? 'BUSINESS' : 'ECONOMY',
                        'okno'          => $okno,
                        'przejscie'     => $przejscie,
                        'lot_id'        => $lot->id,
                    ]);
                }
            }

            return response()->json(
                $lot->load('ceny')->append('cena'),
                201
            );
        });
    }

    /* =========================
       GET /api/loty/{id}
       ➕ CENY
    ========================= */
    public function show($id)
    {
        $lot = Lot::with([
            'trasa.lotniskoWylotu',
            'trasa.lotniskoPrzylotu',
            'samolot',
            'miejsca',
            'ceny'
        ])->findOrFail($id);

        $lot->cena = $lot->ceny->min('cena');

        return response()->json($lot);
    }

    /* =========================
       PUT /api/loty/{id}
       ➕ EDYCJA CEN
    ========================= */
    public function update(Request $request, $id)
    {
        $lot = Lot::findOrFail($id);

        $data = $request->validate([
            'data'          => 'sometimes|date',
            'godzina'       => 'sometimes',
            'status'        => 'sometimes|string|max:20',
            'trasa_id'      => 'sometimes|exists:trasas,id',
            'samolot_id'    => 'sometimes|exists:samolots,id',
            'cena_economy'  => 'sometimes|numeric|min:0',
            'cena_business' => 'sometimes|numeric|min:0',
        ]);

        if (array_key_exists('samolot_id', $data)) {
            $maMiejsca = Miejsce::where('lot_id', $lot->id)->exists();
            if ($maMiejsca && $data['samolot_id'] != $lot->samolot_id) {
                abort(409, 'Nie można zmienić samolotu po wygenerowaniu miejsc');
            }
        }

        DB::transaction(function () use ($lot, $data) {

            $lot->update($data);

            if (isset($data['cena_economy'])) {
                LotCena::updateOrCreate(
                    ['lot_id' => $lot->id, 'klasa' => 'ECONOMY'],
                    ['cena' => $data['cena_economy']]
                );
            }

            if (isset($data['cena_business'])) {
                LotCena::updateOrCreate(
                    ['lot_id' => $lot->id, 'klasa' => 'BUSINESS'],
                    ['cena' => $data['cena_business']]
                );
            }
        });

        $lot->load('ceny');
        $lot->cena = $lot->ceny->min('cena');

        return response()->json($lot);
    }

    /* =========================
       DELETE /api/loty/{id}
    ========================= */
    public function destroy($id)
    {
        $lot = Lot::findOrFail($id);

        $maAktywneRezerwacje = Rezerwacja::whereIn('status', ['OCZEKUJE', 'POTWIERDZONA'])
            ->whereHas('miejsce', fn ($q) => $q->where('lot_id', $lot->id))
            ->exists();

        if ($maAktywneRezerwacje) {
            abort(409, 'Nie można usunąć lotu z aktywnymi rezerwacjami');
        }

        $lot->delete();

        return response()->json(['message' => 'Lot usunięty']);
    }

    /* =========================
       GET /api/loty/{id}/miejsca
    ========================= */
    public function dostepneMiejsca($id)
    {
        $lot = Lot::findOrFail($id);

        $zajete = Rezerwacja::whereIn('status', ['OCZEKUJE', 'POTWIERDZONA'])
            ->pluck('miejsce_id');

        return response()->json(
            Miejsce::where('lot_id', $lot->id)
                ->whereNotIn('id', $zajete)
                ->orderBy('numer_miejsca')
                ->get()
        );
    }
}

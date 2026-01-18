<?php

namespace App\Http\Controllers;

use App\Models\Rezerwacja;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Illuminate\Database\QueryException;

class RezerwacjaController extends Controller
{
    private function requireRole(Request $request, array $roles): void
    {
        $role = $request->header('X-User-Role');

        if (!$role) {
            abort(401, 'Brak roli użytkownika');
        }

        $role = strtoupper($role);
        $roles = array_map('strtoupper', $roles);

        if (!in_array($role, $roles)) {
            abort(403, 'Brak uprawnień');
        }
    }

    private function wygasRezerwacje(): void
    {
        Rezerwacja::where('status', 'OCZEKUJE')
            ->whereNotNull('wygasa_o')
            ->where('wygasa_o', '<', now())
            ->update([
                'status' => 'WYGASLA',
                'wygasa_o' => null,
            ]);
    }

    public function index(Request $request)
    {
        $this->wygasRezerwacje();

        return Rezerwacja::with([
            'klient',
            'miejsce.lot.trasa.lotniskoWylotu',
            'miejsce.lot.trasa.lotniskoPrzylotu'
        ])->get();
    }

    public function show(Request $request, $id)
    {
        $this->wygasRezerwacje();

        return Rezerwacja::with([
            'klient',
            'miejsce.lot.trasa.lotniskoWylotu',
            'miejsce.lot.trasa.lotniskoPrzylotu'
        ])->findOrFail($id);
    }

    public function store(Request $request)
    {
        $this->wygasRezerwacje();

        $validated = $request->validate([
            'klient_id'    => 'required|exists:klients,id',
            'miejsce_id'   => 'required|exists:miejscas,id',
            'pracownik_id' => 'nullable|exists:pracowniks,id',
        ]);

        try {
            return DB::transaction(function () use ($validated) {

                // twarda blokada miejsca (spójna z modelem)
                $zajete = Rezerwacja::where('miejsce_id', $validated['miejsce_id'])
                    ->whereIn('status', ['OCZEKUJE', 'POTWIERDZONA'])
                    ->where(function ($q) {
                        $q->whereNull('wygasa_o')
                          ->orWhere('wygasa_o', '>', now());
                    })
                    ->exists();

                if ($zajete) {
                    throw ValidationException::withMessages([
                        'miejsce_id' => 'To miejsce jest już zajęte w tym locie',
                    ]);
                }

                return response()->json(
                    Rezerwacja::create([
                        'klient_id'       => $validated['klient_id'],
                        'miejsce_id'      => $validated['miejsce_id'],
                        'pracownik_id'    => $validated['pracownik_id'] ?? null,
                        'status'          => 'OCZEKUJE',
                        'data_rezerwacji' => now()->toDateString(),
                        'wygasa_o'        => now()->addMinutes(15),
                    ]),
                    201
                );
            });
        } catch (QueryException $e) {

            // ochrona przed race condition (UNIQUE miejsce_id)
            if ($e->getCode() === '23000') {
                throw ValidationException::withMessages([
                    'miejsce_id' => 'To miejsce zostało właśnie zajęte przez innego użytkownika',
                ]);
            }

            throw $e;
        }
    }

    public function update(Request $request, $id)
    {
        $this->requireRole($request, ['KASJER', 'MENADZER', 'ADMIN']);

        $rezerwacja = Rezerwacja::findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|in:OCZEKUJE,POTWIERDZONA,ANULOWANA,WYGASLA',
            'pracownik_id' => 'nullable|exists:pracowniks,id',
        ]);

        $rezerwacja->update($validated);

        return response()->json($rezerwacja);
    }

    public function destroy(Request $request, $id)
    {
        $this->requireRole($request, ['ADMIN']);

        Rezerwacja::findOrFail($id)->delete();

        return response()->json([
            'message' => 'Rezerwacja usunięta'
        ]);
    }

    public function pracownikRezerwacje(Request $request)
    {
        $this->requireRole($request, ['KASJER', 'MENADZER']);

        $this->wygasRezerwacje();

        return Rezerwacja::with([
            'klient',
            'miejsce.lot.trasa.lotniskoWylotu',
            'miejsce.lot.trasa.lotniskoPrzylotu'
        ])
        ->whereIn('status', ['OCZEKUJE', 'POTWIERDZONA'])
        ->orderByDesc('data_rezerwacji')
        ->get();
    }
    public function zmienMiejsce(Request $request)
    {
        $this->requireRole($request, ['KASJER','CLIENT', 'MENADZER']);

        $validated = $request->validate([
            'rezerwacja_id'   => 'required|exists:rezerwacjes,id',
            'nowe_miejsce_id' => 'required|exists:miejscas,id',
        ]);

        return DB::transaction(function () use ($validated) {

            $rezerwacja = Rezerwacja::with('miejsce')->findOrFail(
                $validated['rezerwacja_id']
            );

            // jeżeli to samo miejsce
            if ($rezerwacja->miejsce_id == $validated['nowe_miejsce_id']) {
                return response()->json([
                    'message' => 'Wybrano to samo miejsce'
                ], 409);
            }

            // sprawdzenie czy nowe miejsce nie jest zajęte
            $zajete = Rezerwacja::where('miejsce_id', $validated['nowe_miejsce_id'])
                ->whereIn('status', ['OCZEKUJE', 'POTWIERDZONA'])
                ->where(function ($q) {
                    $q->whereNull('wygasa_o')
                    ->orWhere('wygasa_o', '>', now());
                })
                ->exists();

            if ($zajete) {
                throw ValidationException::withMessages([
                    'nowe_miejsce_id' => 'To miejsce jest już zajęte',
                ]);
            }

            // zmiana miejsca
            $rezerwacja->update([
                'miejsce_id' => $validated['nowe_miejsce_id']
            ]);

            return response()->json([
                'message' => 'Miejsce zmienione poprawnie'
            ]);
        });
    }

}

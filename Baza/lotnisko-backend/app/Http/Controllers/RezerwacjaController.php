<?php

namespace App\Http\Controllers;

use App\Models\Rezerwacja;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class RezerwacjaController extends Controller
{
    /* ======================================================
       AUTORYZACJA RÓL
    ====================================================== */
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

    /* ======================================================
       WYGASZANIE REZERWACJI
    ====================================================== */
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

    /* ======================================================
       GET /api/rezerwacje
    ====================================================== */
    public function index(Request $request)
    {
        $this->wygasRezerwacje();

        return Rezerwacja::with([
            'klient',
            'miejsce',
            'lot.trasa.lotniskoWylotu',
            'lot.trasa.lotniskoPrzylotu'
        ])->get();
    }

    /* ======================================================
       GET /api/rezerwacje/{id}
    ====================================================== */
    public function show(Request $request, $id)
    {
        $this->wygasRezerwacje();

        return Rezerwacja::with([
            'klient',
            'miejsce',
            'lot.trasa.lotniskoWylotu',
            'lot.trasa.lotniskoPrzylotu'
        ])->findOrFail($id);
    }

    /* ======================================================
       POST /api/rezerwacje
    ====================================================== */
    public function store(Request $request)
    {
        $this->wygasRezerwacje();

        $validated = $request->validate([
            'klient_id' => 'required|exists:klients,id',
            'lot_id' => 'required|exists:lots,id',
            'miejsce_id' => 'required|exists:miejscas,id',
            'pracownik_id' => 'nullable|exists:pracowniks,id',
        ]);

        return DB::transaction(function () use ($validated) {

            $zajete = Rezerwacja::where('lot_id', $validated['lot_id'])
                ->where('miejsce_id', $validated['miejsce_id'])
                ->whereIn('status', ['OCZEKUJE', 'POTWIERDZONA'])
                ->where(function ($q) {
                    $q->whereNull('wygasa_o')
                      ->orWhere('wygasa_o', '>', now());
                })
                ->exists();

            if ($zajete) {
                throw ValidationException::withMessages([
                    'miejsce_id' => 'To miejsce jest już zajęte na ten lot',
                ]);
            }

            return response()->json(
                Rezerwacja::create([
                    'klient_id' => $validated['klient_id'],
                    'lot_id' => $validated['lot_id'],
                    'miejsce_id' => $validated['miejsce_id'],
                    'pracownik_id' => $validated['pracownik_id'] ?? null,
                    'status' => 'OCZEKUJE',
                    'data_rezerwacji' => now()->toDateString(),
                    'wygasa_o' => now()->addMinutes(15),
                ]),
                201
            );
        });
    }

    /* ======================================================
       PUT /api/rezerwacje/{id}
    ====================================================== */
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

    /* ======================================================
       DELETE /api/rezerwacje/{id}
    ====================================================== */
    public function destroy(Request $request, $id)
    {
        $this->requireRole($request, ['ADMIN']);

        Rezerwacja::findOrFail($id)->delete();

        return response()->json([
            'message' => 'Rezerwacja usunięta'
        ]);
    }

    /* ======================================================
       REZERWACJE DLA KASJERA
       GET /api/pracownik/rezerwacje
    ====================================================== */
    public function pracownikRezerwacje(Request $request)
    {
        $this->requireRole($request, ['KASJER', 'MENADZER']);

        $this->wygasRezerwacje();

        $rezerwacje = Rezerwacja::with([
            'klient',
            'miejsce',
            'lot.trasa.lotniskoWylotu',
            'lot.trasa.lotniskoPrzylotu'
        ])
        ->whereIn('status', ['OCZEKUJE', 'POTWIERDZONA'])
        ->orderByDesc('data_rezerwacji')
        ->get();

        return response()->json($rezerwacje);
    }
}

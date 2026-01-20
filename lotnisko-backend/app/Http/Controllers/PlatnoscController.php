<?php

namespace App\Http\Controllers;

use App\Models\Platnosc;
use App\Models\Bilet;
use App\Models\Rezerwacja;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use App\Models\Klient;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Pracownik;

class PlatnoscController extends Controller
{
    //Autoryzacja ról
    private function requireRole(Request $request, array $roles): void
    {
        $role = strtoupper($request->header('X-User-Role'));

        if (!$role) {
            abort(401, 'Brak roli użytkownika');
        }

        if (!in_array($role, array_map('strtoupper', $roles))) {
            abort(403, 'Brak uprawnień');
        }
    }

    //wygaszanie rezertwacji
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

    
    public function store(Request $request)
    {
        $this->requireRole($request, ['CLIENT', 'KASJER', 'MENADZER', 'ADMIN']);

        $this->wygasRezerwacje();

        $validated = $request->validate([
            'kwota'     => 'required|integer|min:1',
            'metoda'    => 'required|string|max:30',
            'klient_id' => 'required|exists:klients,id',
            'bilet_id'  => 'required|exists:bilets,id|unique:platnosci,bilet_id',
        ]);

        return DB::transaction(function () use ($validated) {

            $bilet = Bilet::lockForUpdate()->findOrFail($validated['bilet_id']);
            $rezerwacja = Rezerwacja::lockForUpdate()->findOrFail($bilet->rezerwacja_id);

            if (!in_array($rezerwacja->status, ['OCZEKUJE', 'POTWIERDZONA'])) {
                throw ValidationException::withMessages([
                    'rezerwacja' => 'Rezerwacja nie jest aktywna',
                ]);
            }

            if ($bilet->status === 'OPLACONY') {
                throw ValidationException::withMessages([
                    'bilet' => 'Bilet został już opłacony',
                ]);
            }

            $platnosc = Platnosc::create([
                'kwota' => $validated['kwota'],
                'metoda' => $validated['metoda'],
                'data_platnosci' => now()->toDateString(),
                'klient_id' => $validated['klient_id'],
                'bilet_id' => $bilet->id,
            ]);

            $bilet->update(['status' => 'OPLACONY']);
            $rezerwacja->update([
                'status' => 'POTWIERDZONA',
                'wygasa_o' => null,
            ]);

            return response()->json([
                'platnosc_id' => $platnosc->id,
                'numer_biletu' => $bilet->numer_biletu,
                'status' => 'OPLACONA'
            ], 201);
        });
    }


public function zwrotKasjerski(Request $request, $id)
{
    $this->requireRole($request, ['KASJER', 'MENADZER', 'ADMIN']);

    $request->validate([
        'pin' => 'required|string|min:6',
    ]);

    try {
        return DB::transaction(function () use ($request, $id) {

            $bilet = Bilet::with('rezerwacja')
                ->lockForUpdate()
                ->findOrFail($id);

            if ($bilet->status !== 'OPLACONY') {
                throw ValidationException::withMessages([
                    'bilet' => 'Bilet nie jest opłacony lub był już zwrócony'
                ]);
            }

            $rezerwacja = $bilet->rezerwacja;

            if (!$rezerwacja || !$rezerwacja->klient_id) {
                throw ValidationException::withMessages([
                    'klient' => 'Brak klienta przypisanego do biletu'
                ]);
            }

            $klient = Klient::findOrFail($rezerwacja->klient_id);

            // 🔐 PIN = HASŁO KLIENTA
            if (!Hash::check($request->pin, $klient->haslo)) {
                abort(403, 'Nieprawidłowy PIN klienta');
            }

            Platnosc::create([
                'kwota'     => -350,
                'metoda'    => 'GOTOWKA',
                'status'    => 'ZWROT',
                'data_platnosci' => now(),   // ⬅⬅⬅ BRAKUJĄCE POLE
                'bilet_id'  => $bilet->id,
                'klient_id' => $klient->id,
            ]);

            $bilet->update(['status' => 'ZWROCONY']);
            $rezerwacja->update(['status' => 'ANULOWANA']);

            return response()->json([
                'message' => 'Zwrot wykonany poprawnie',
                'bilet_id' => $bilet->id,
            ]);
        });
    } catch (\Throwable $e) {
        return response()->json([
            'error' => $e->getMessage()
        ], 500);
    }
}




    //Lista Platnosci
    public function index()
    {
        return response()->json(
            Platnosc::orderBy('created_at', 'desc')->get()
        );
    }

}

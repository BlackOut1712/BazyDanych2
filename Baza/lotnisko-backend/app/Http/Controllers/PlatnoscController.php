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

class PlatnoscController extends Controller
{
    /**
     * 🔐 AUTORYZACJA RÓL
     */
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

    /**
     * 🔁 WYGASZANIE REZERWACJI
     */
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

    /**
     * 💳 POST /api/platnosci
     * CLIENT / KASJER / MENADZER / ADMIN
     */
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

            // ✅ POPRAWKA: po wystawieniu biletu rezerwacja jest POTWIERDZONA
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

    /**
     * 🔄 POST /api/bilety/zwrot
     * KASJER / MENADZER / ADMIN
     */
    public function zwrot(Request $request)
    {
        $this->requireRole($request, ['KASJER', 'MENADZER', 'ADMIN']);

        $validated = $request->validate([
            'numer_biletu' => 'required|string|exists:bilets,numer_biletu',
            'pin' => 'required|string',
            'pracownik_id' => 'required|exists:pracowniks,id',
        ]);

        return DB::transaction(function () use ($validated) {

            $bilet = Bilet::lockForUpdate()
                ->where('numer_biletu', $validated['numer_biletu'])
                ->firstOrFail();

            if ($bilet->status !== 'OPLACONY') {
                throw ValidationException::withMessages([
                    'bilet' => 'Bilet nie jest opłacony lub był już zwrócony',
                ]);
            }

            $rezerwacja = Rezerwacja::lockForUpdate()
                ->findOrFail($bilet->rezerwacja_id);

            $klient = Klient::lockForUpdate()
                ->findOrFail($rezerwacja->klient_id);

            if (!Hash::check($validated['pin'], $klient->haslo)) {
                throw ValidationException::withMessages([
                    'pin' => 'Nieprawidłowy PIN klienta',
                ]);
            }

            $bilet->update(['status' => 'ZWRÓCONY']);
            $rezerwacja->update(['status' => 'ANULOWANA']);

            return response()->json([
                'message' => 'Zwrot biletu wykonany poprawnie',
                'numer_biletu' => $bilet->numer_biletu,
            ]);
        });
    }

    /**
     * 📋 LISTA PŁATNOŚCI
     */
    public function index()
    {
        return response()->json(
            Platnosc::with('bilet')->get()
        );
    }
}

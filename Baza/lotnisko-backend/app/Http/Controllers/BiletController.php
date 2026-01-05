<?php

namespace App\Http\Controllers;

use App\Models\Bilet;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;

class BiletController extends Controller
{
    /**
     * 🔐 AUTORYZACJA RÓL (zamiennik middleware)
     */
    private function requireRole(Request $request, array $roles): void
    {
        $role = $request->header('X-User-Role');

        if (!$role) {
            abort(401, 'Brak roli użytkownika');
        }

        if (!in_array($role, $roles)) {
            abort(403, 'Brak uprawnień');
        }
    }

    /**
     * POST /api/bilety
     * Tworzenie biletu na podstawie rezerwacji
     * cashier / admin
     */
    public function store(Request $request)
    {
        $this->requireRole($request, ['cashier', 'admin']);

        $validated = $request->validate([
            'imie_pasazera' => 'required|string|max:100',
            'nazwisko_pasazera' => 'required|string|max:100',
            'pesel_pasazera' => 'required|string|size:11',

            'rezerwacja_id' => 'required|exists:rezerwacjes,id',
            'lot_id' => 'required|exists:lots,id',

            'miejsce_id' => [
                'required',
                'exists:miejscas,id',
                Rule::unique('bilets')->where(fn ($q) =>
                    $q->where('lot_id', $request->lot_id)
                ),
            ],
        ]);

        $validated['numer_biletu'] = strtoupper(Str::random(8));
        $validated['data_wystawienia'] = now()->toDateString();
        $validated['status'] = 'NOWY';

        $bilet = Bilet::create($validated);

        return response()->json($bilet, 201);
    }

    /**
     * GET /api/bilety
     * admin
     */
    public function index(Request $request)
    {
        $this->requireRole($request, ['admin']);

        return Bilet::all();
    }

    /**
     * ✅ E – MOJE BILETY
     * GET /api/moje-bilety/{klient_id}
     * client
     */
    public function mojeBilety(Request $request, $klient_id)
    {
        $this->requireRole($request, ['client']);

        $bilety = Bilet::with([
                'rezerwacja.lot.trasa.lotniskoWylotu',
                'rezerwacja.lot.trasa.lotniskoPrzylotu',
                'miejsce'
            ])
            ->whereHas('rezerwacja', function ($q) use ($klient_id) {
                $q->where('klient_id', $klient_id);
            })
            ->orderByDesc('data_wystawienia')
            ->get();

        return response()->json($bilety);
    }

    /**
     * F – bilety opłacone (do zwrotu / obsługi)
     * GET /api/pracownik/bilety-oplacone
     * cashier / admin
     */
    public function pracownikBiletyOplacone(Request $request)
    {
        $this->requireRole($request, ['cashier', 'admin']);

        $bilety = Bilet::with([
                'rezerwacja.klient',
                'miejsce',
                'rezerwacja.lot.trasa.lotniskoWylotu',
                'rezerwacja.lot.trasa.lotniskoPrzylotu'
            ])
            ->where('status', 'OPLACONY')
            ->orderByDesc('data_wystawienia')
            ->get();

        return response()->json($bilety);
    }
}

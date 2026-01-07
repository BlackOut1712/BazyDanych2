<?php

namespace App\Http\Controllers;

use App\Models\Bilet;
use App\Models\Rezerwacja;
use App\Models\Platnosc;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class BiletController extends Controller
{
    /* ======================================================
       AUTORYZACJA RÓL
    ====================================================== */
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

    /* ======================================================
       SPRZEDAŻ BILETU
       POST /api/bilety
       KASJER / MENADZER / ADMIN
    ====================================================== */
    public function store(Request $request)
    {
        $this->requireRole($request, ['KASJER', 'MENADZER', 'ADMIN']);

        $data = $request->validate([
            'imie_pasazera'     => 'required|string|max:100',
            'nazwisko_pasazera' => 'required|string|max:100',
            'pesel_pasazera'    => 'required|string|size:11',
            'rezerwacja_id'     => 'required|exists:rezerwacjes,id',
            'lot_id'            => 'required|exists:lots,id',
            'miejsce_id'        => 'required|exists:miejscas,id',
        ]);

        return DB::transaction(function () use ($data) {

            // blokada rezerwacji
            $rezerwacja = Rezerwacja::lockForUpdate()
                ->findOrFail($data['rezerwacja_id']);

            // spójny status z RezerwacjaController
            if ($rezerwacja->status !== 'OCZEKUJE') {
                abort(409, 'Rezerwacja została już obsłużona');
            }

            // wystawienie biletu
            $bilet = Bilet::create([
                'numer_biletu'      => strtoupper(Str::random(8)),
                'imie_pasazera'     => $data['imie_pasazera'],
                'nazwisko_pasazera' => $data['nazwisko_pasazera'],
                'pesel_pasazera'    => $data['pesel_pasazera'],
                'rezerwacja_id'     => $data['rezerwacja_id'],
                'lot_id'            => $data['lot_id'],
                'miejsce_id'        => $data['miejsce_id'],
                'data_wystawienia'  => now()->toDateString(),
                'status'            => 'OPLACONY'
            ]);

            // potwierdzenie rezerwacji
            $rezerwacja->update([
                'status' => 'POTWIERDZONA'
            ]);

            return response()->json($bilet, 201);
        });
    }

    /* ======================================================
       ZWROT BILETU
       POST /api/bilety/zwrot
       KASJER / MENADZER / ADMIN
    ====================================================== */
    public function refund(Request $request)
    {
        $this->requireRole($request, ['KASJER', 'MENADZER', 'ADMIN']);

        $data = $request->validate([
            'numer_biletu' => 'required|string|exists:bilets,numer_biletu',
        ]);

        return DB::transaction(function () use ($data) {

            $bilet = Bilet::with('rezerwacja')
                ->lockForUpdate()
                ->where('numer_biletu', $data['numer_biletu'])
                ->firstOrFail();

            if ($bilet->status !== 'OPLACONY') {
                abort(409, 'Tylko opłacony bilet może zostać zwrócony');
            }

            // zwrot płatności (zostaje tu)
            Platnosc::create([
                'kwota'     => -350,
                'metoda'    => 'GOTOWKA',
                'status'    => 'ZWROT',
                'bilet_id'  => $bilet->id,
                'klient_id' => $bilet->rezerwacja->klient_id
            ]);

            // statusy
            $bilet->update(['status' => 'ZWRÓCONY']);
            $bilet->rezerwacja->update(['status' => 'ANULOWANA']);

            return response()->json([
                'message' => 'Zwrot biletu wykonany poprawnie',
                'numer_biletu' => $bilet->numer_biletu
            ]);
        });
    }

    /* ======================================================
       LISTA BILETÓW – ADMIN
    ====================================================== */
    public function index(Request $request)
    {
        $this->requireRole($request, ['ADMIN']);
        return Bilet::all();
    }

    /* ======================================================
       MOJE BILETY – CLIENT
    ====================================================== */
    public function mojeBilety(Request $request, $klient_id)
    {
        $this->requireRole($request, ['CLIENT']);

        return Bilet::with([
            'rezerwacja.lot.trasa.lotniskoWylotu',
            'rezerwacja.lot.trasa.lotniskoPrzylotu',
            'miejsce'
        ])
        ->whereHas('rezerwacja', fn ($q) =>
            $q->where('klient_id', $klient_id)
        )
        ->orderByDesc('data_wystawienia')
        ->get();
    }

    /* ======================================================
       BILETY OPŁACONE – KASJER
    ====================================================== */
    public function pracownikBiletyOplacone(Request $request)
    {
        $this->requireRole($request, ['KASJER', 'MENADZER', 'ADMIN']);

        return Bilet::with([
            'rezerwacja.klient',
            'miejsce',
            'rezerwacja.lot.trasa.lotniskoWylotu',
            'rezerwacja.lot.trasa.lotniskoPrzylotu'
        ])
        ->where('status', 'OPLACONY')
        ->orderByDesc('data_wystawienia')
        ->get();
    }
}

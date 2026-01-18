<?php

namespace App\Http\Controllers;

use App\Models\Bilet;
use App\Models\Rezerwacja;
use App\Models\Platnosc;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Barryvdh\DomPDF\Facade\Pdf;

class BiletController extends Controller
{
    // =============================
    // AUTORYZACJA RÓL
    // =============================
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

    // =============================
    // SPRZEDAŻ BILETU (KASJER / MENADŻER)
    // =============================
    public function store(Request $request)
    {
        $this->requireRole($request, ['KASJER', 'MENADZER']);

        $data = $request->validate([
            'imie_pasazera'     => 'required|string|max:100',
            'nazwisko_pasazera' => 'required|string|max:100',
            'pesel_pasazera'    => 'required|string|size:11',
            'rezerwacja_id'     => 'required|exists:rezerwacjes,id',
        ]);

        return DB::transaction(function () use ($data) {

            $rezerwacja = Rezerwacja::with('miejsce')
                ->lockForUpdate()
                ->findOrFail($data['rezerwacja_id']);

            if ($rezerwacja->status !== 'OCZEKUJE') {
                abort(409, 'Rezerwacja została już obsłużona');
            }

            if (!$rezerwacja->miejsce) {
                abort(500, 'Rezerwacja nie ma przypisanego miejsca');
            }

            $miejsce = $rezerwacja->miejsce;

            $bilet = Bilet::create([
                'numer_biletu'      => strtoupper(Str::random(8)),
                'imie_pasazera'     => $data['imie_pasazera'],
                'nazwisko_pasazera' => $data['nazwisko_pasazera'],
                'pesel_pasazera'    => $data['pesel_pasazera'],
                'rezerwacja_id'     => $rezerwacja->id,
                'miejsce_id'        => $miejsce->id,
                'lot_id'            => $miejsce->lot_id,
                'data_wystawienia'  => now()->toDateString(),
                'status'            => 'NOWY',
            ]);

            $rezerwacja->update([
                'status' => 'POTWIERDZONA',
            ]);

            return response()->json($bilet, 201);
        });
    }

    // =============================
    // 🔥 ZAKUP BILETU PRZEZ KLIENTA (BLIK)
    // =============================
    public function storeClient(Request $request)
{
    $this->requireRole($request, ['CLIENT']);

    // 🔹 WALIDACJA – pola pasażera NIE MUSZĄ być wymagane
    $data = $request->validate([
        'rezerwacja_id'     => 'required|exists:rezerwacjes,id',
        'imie_pasazera'     => 'nullable|string|max:100',
        'nazwisko_pasazera' => 'nullable|string|max:100',
        'pesel_pasazera'    => 'nullable|string|size:11',
    ]);

    $klientId = $request->header('X-Client-Id');

    if (!$klientId) {
        abort(401, 'Brak identyfikatora klienta');
    }

    return DB::transaction(function () use ($data, $klientId) {

        $rezerwacja = Rezerwacja::with(['miejsce', 'klient'])
            ->lockForUpdate()
            ->findOrFail($data['rezerwacja_id']);

        // 🔧 BEZPIECZEŃSTWO: rezerwacja musi należeć do klienta
        if ($rezerwacja->klient_id && $rezerwacja->klient_id != $klientId) {
            abort(403, 'Ta rezerwacja nie należy do zalogowanego klienta');
        }

        // 🔧 jeżeli klient kupuje → przypisujemy klient_id (jeśli brak)
        if (!$rezerwacja->klient_id) {
            $rezerwacja->update([
                'klient_id' => $klientId
            ]);
        }

        if ($rezerwacja->status !== 'OCZEKUJE') {
            abort(409, 'Rezerwacja została już obsłużona');
        }

        if (!$rezerwacja->miejsce) {
            abort(500, 'Rezerwacja nie ma przypisanego miejsca');
        }

        if (!$rezerwacja->klient) {
            abort(500, 'Brak danych klienta do wystawienia biletu');
        }

        $klient = $rezerwacja->klient;
        $miejsce = $rezerwacja->miejsce;

        // 🔥 KLUCZOWA LOGIKA:
        // jeśli pole puste → bierzemy z konta klienta
        $imie     = $data['imie_pasazera']     ?: $klient->imie;
        $nazwisko = $data['nazwisko_pasazera'] ?: $klient->nazwisko;
        $pesel    = $data['pesel_pasazera']    ?: $klient->pesel;

        if (!$imie || !$nazwisko || !$pesel) {
            abort(422, 'Brak danych pasażera (formularz + konto klienta)');
        }

        $bilet = Bilet::create([
            'numer_biletu'      => strtoupper(Str::random(8)),
            'imie_pasazera'     => $imie,
            'nazwisko_pasazera' => $nazwisko,
            'pesel_pasazera'    => $pesel,

            'rezerwacja_id'    => $rezerwacja->id,
            'miejsce_id'       => $miejsce->id,
            'lot_id'           => $miejsce->lot_id,

            'data_wystawienia' => now()->toDateString(),
            'status'           => 'OPLACONY',
        ]);

        $rezerwacja->update([
            'status' => 'POTWIERDZONA'
        ]);

        return response()->json($bilet, 201);
    });
}

    // =============================
    // ZWROT BILETU (KASJER / MENADŻER)
    // =============================
    public function refund(Request $request)
    {
        $this->requireRole($request, ['KASJER','CLIENT', 'MENADZER']);

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

            Platnosc::create([
                'kwota'     => -350,
                'metoda'    => 'GOTOWKA',
                'status'    => 'ZWROT',
                'bilet_id'  => $bilet->id,
                'klient_id' => $bilet->rezerwacja->klient_id,
            ]);

            $bilet->update(['status' => 'ZWRÓCONY']);
            $bilet->rezerwacja->update(['status' => 'ANULOWANA']);

            return response()->json([
                'message'      => 'Zwrot biletu wykonany poprawnie',
                'numer_biletu' => $bilet->numer_biletu,
            ]);
        });
    }

    // =============================
    // LISTA BILETÓW (PRACOWNICY)
    // =============================
    public function index(Request $request)
    {
        $this->requireRole($request, ['KASJER', 'MENADZER']);

        return Bilet::with([
            'rezerwacja',
            'rezerwacja.miejsce',
            'rezerwacja.miejsce.lot',
            'rezerwacja.miejsce.lot.trasa.lotniskoWylotu',
            'rezerwacja.miejsce.lot.trasa.lotniskoPrzylotu',
        ])->get();
    }

    // =============================
    // BILETY KLIENTA (HISTORIA)
    // =============================
    public function moje(Request $request)
    {
        $this->requireRole($request, ['CLIENT']);

        $klientId = $request->header('X-Client-Id');

        if (!$klientId) {
            return response()->json([], 200);
        }

        return Bilet::with([
            'rezerwacja',
            'rezerwacja.miejsce',
            'rezerwacja.miejsce.lot',
            'rezerwacja.miejsce.lot.trasa',
            'rezerwacja.miejsce.lot.trasa.lotniskoWylotu',
            'rezerwacja.miejsce.lot.trasa.lotniskoPrzylotu',
        ])
            ->whereHas('rezerwacja', function ($q) use ($klientId) {
                $q->where('klient_id', $klientId);
            })
            ->orderByDesc('data_wystawienia')
            ->get();
    }


    // =============================
    // FAKTURA
    // =============================
    public function faktura(Request $request, $id)
    {
        $this->requireRole($request, ['KASJER', 'MENADZER']);

        $bilet = Bilet::with([
            'rezerwacja.klient',
            'rezerwacja.miejsce',
            'rezerwacja.miejsce.lot.ceny',
            'rezerwacja.miejsce.lot.trasa.lotniskoWylotu',
            'rezerwacja.miejsce.lot.trasa.lotniskoPrzylotu'
        ])->findOrFail($id);

        if ($bilet->status !== 'OPLACONY') {
            abort(409, 'Faktura dostępna tylko dla opłaconych biletów');
        }

        /* =========================
        ✅ WYLICZENIE CENY Z BAZY
        (MINIMALNA DOKŁADKA)
        ========================= */
        $kwota = null;

        $miejsce = $bilet->rezerwacja->miejsce ?? null;
        $lot = $miejsce?->lot ?? null;

        if ($lot && $miejsce && $lot->ceny) {
            $cena = $lot->ceny->firstWhere(
                'klasa',
                strtoupper($miejsce->klasa)
            );

            if ($cena && $cena->cena !== null) {
                $kwota = $cena->cena;
            }
        }

        // 🧯 fallback – zostaje jak było
        if ($kwota === null) {
            $kwota = 300;
        }

        $pdf = Pdf::loadView('pdf.faktura', [
            'numer_faktury' => 'FV/' . now()->format('Ymd') . '/' . $bilet->id,
            'data' => now()->toDateString(),
            'bilet' => $bilet,
            'klient' => $bilet->rezerwacja->klient,
            'lot' => $lot,
            'trasa' => $lot->trasa,
            'miejsce' => $miejsce,
            'kwota' => $kwota
        ]);

        return $pdf->stream('faktura.pdf');
    }

    public function fakturaWeb(Request $request, $id)
    {
        $request->headers->set(
            'X-User-Role',
            session('user_role') ?? 'KASJER'
        );

        return $this->faktura($request, $id);
    }

    // =============================
    // CREATE AFTER PAYMENT (ZOSTAJE)
    // =============================
    public function createAfterPayment(Request $request)
    {
        $this->requireRole($request, ['CLIENT']);

        $data = $request->validate([
            'rezerwacja_id' => 'required|exists:rezerwacjes,id',
        ]);

        $klientId = $request->header('X-Client-Id');

        return DB::transaction(function () use ($data, $klientId) {

            $rezerwacja = Rezerwacja::with('miejsce')
                ->lockForUpdate()
                ->findOrFail($data['rezerwacja_id']);

            if ($klientId && !$rezerwacja->klient_id) {
                $rezerwacja->update([
                    'klient_id' => $klientId
                ]);
            }

            if ($rezerwacja->status !== 'OCZEKUJE') {
                abort(409, 'Rezerwacja już obsłużona');
            }

            $bilet = Bilet::create([
                'numer_biletu'      => strtoupper(Str::random(8)),
                'imie_pasazera'     => $rezerwacja->imie_pasazera ?? '—',
                'nazwisko_pasazera' => $rezerwacja->nazwisko_pasazera ?? '—',
                'pesel_pasazera'    => $rezerwacja->pesel_pasazera ?? '—',
                'rezerwacja_id'     => $rezerwacja->id,
                'miejsce_id'        => $rezerwacja->miejsce->id,
                'lot_id'            => $rezerwacja->miejsce->lot_id,
                'data_wystawienia'  => now()->toDateString(),
                'status'            => 'OPLACONY',
            ]);

            $rezerwacja->update([
                'status' => 'POTWIERDZONA',
            ]);

            return response()->json($bilet, 201);
        });
    }
    public function biletKlienta(Request $request, $id)
    {
        $this->requireRole($request, ['CLIENT']);

        $klientId = $request->header('X-Client-Id');

        $bilet = Bilet::with([
            'rezerwacja.miejsce.lot.trasa.lotniskoWylotu',
            'rezerwacja.miejsce.lot.trasa.lotniskoPrzylotu'
        ])
        ->where('id', $id)
        ->whereHas('rezerwacja', function ($q) use ($klientId) {
            $q->where('klient_id', $klientId);
        })
        ->firstOrFail();

        return response()->json($bilet);
    }
    public function payExisting(Request $request, $id)
    {
        $this->requireRole($request, ['CLIENT']);

        $klientId = $request->header('X-Client-Id');
        if (!$klientId) {
            abort(401, 'Brak identyfikatora klienta');
        }

        return DB::transaction(function () use ($id, $klientId) {

            $bilet = Bilet::with([
                'rezerwacja.miejsce.lot.ceny'
            ])->lockForUpdate()->findOrFail($id);

            // 🔐 bezpieczeństwo – bilet musi należeć do klienta
            if ($bilet->rezerwacja->klient_id != $klientId) {
                abort(403, 'To nie jest bilet tego klienta');
            }

            if ($bilet->status !== 'NOWY') {
                abort(409, 'Ten bilet nie wymaga opłaty');
            }

            $miejsce = $bilet->rezerwacja->miejsce ?? null;
            $lot     = $miejsce?->lot ?? null;

            if (!$miejsce || !$lot) {
                abort(500, 'Brak danych miejsca lub lotu');
            }

            // =========================
            // 🔥 WYLICZENIE CENY Z BAZY
            // =========================
            $kwota = null;

            if ($lot->ceny && $lot->ceny->count()) {

                $klasa = strtoupper(trim($miejsce->klasa));

                $cena = $lot->ceny->firstWhere('klasa', $klasa);

                if ($cena && $cena->cena !== null) {
                    $kwota = $cena->cena;
                }
            }

            // 🧯 FALLBACK – SYSTEM NIGDY NIE PADA
            if ($kwota === null) {
                $kwota = 350;
            }

            // =========================
            // 💰 ZAPIS PŁATNOŚCI
            // =========================
            Platnosc::create([
                'kwota'          => $kwota,
                'metoda'         => 'BLIK',
                'status'         => 'OPLACONA',
                'data_platnosci' => now(),
                'bilet_id'       => $bilet->id,
                'klient_id'      => $klientId,
            ]);

            // =========================
            // 🎟️ AKTUALIZACJE
            // =========================
            $bilet->update([
                'status' => 'OPLACONY'
            ]);

            $bilet->rezerwacja->update([
                'status' => 'POTWIERDZONA'
            ]);

            return response()->json([
                'message' => 'Bilet opłacony poprawnie',
                'bilet_id' => $bilet->id,
                'kwota' => $kwota
            ]);
        });
    }


}

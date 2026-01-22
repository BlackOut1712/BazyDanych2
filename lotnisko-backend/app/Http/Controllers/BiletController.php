<?php

namespace App\Http\Controllers;

use App\Models\Bilet;
use App\Models\Rezerwacja;
use App\Models\Platnosc;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Models\Miejsce;
use Illuminate\Support\Facades\Hash;
use App\Models\Klient;
class BiletController extends Controller
{

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
                'status' => 'NOWY',
            ]);

            $rezerwacja->update([
                'status' => 'POTWIERDZONA',
            ]);

            return response()->json($bilet, 201);
        });
    }


    public function storeClient(Request $request)
{
    $this->requireRole($request, ['CLIENT']);

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

        if ($rezerwacja->klient_id && (int)$rezerwacja->klient_id !== (int)$klientId) {
            abort(403, 'Ta rezerwacja nie należy do zalogowanego klienta');
        }

        if (!$rezerwacja->klient_id) {
            $rezerwacja->update([
                'klient_id' => $klientId
            ]);
        }

        
        if (!in_array($rezerwacja->status, ['OCZEKUJE', 'POTWIERDZONA'])) {
            abort(409, 'Rezerwacja nieaktywna');
        }

        if (!$rezerwacja->miejsce || !$rezerwacja->klient) {
            abort(500, 'Niekompletne dane rezerwacji');
        }

        $klient  = $rezerwacja->klient;
        $miejsce = $rezerwacja->miejsce;

        $imie     = $data['imie_pasazera']     ?: $klient->imie;
        $nazwisko = $data['nazwisko_pasazera'] ?: $klient->nazwisko;
        $pesel    = $data['pesel_pasazera']    ?: $klient->pesel;

        if (!$imie || !$nazwisko || !$pesel) {
            abort(422, 'Brak danych pasażera');
        }

        $bilet = Bilet::create([
            'numer_biletu'      => strtoupper(Str::random(8)),
            'imie_pasazera'     => $imie,
            'nazwisko_pasazera' => $nazwisko,
            'pesel_pasazera'    => $pesel,

            'rezerwacja_id'     => $rezerwacja->id,
            'miejsce_id'        => $miejsce->id,
            'lot_id'            => $miejsce->lot_id,

            'data_wystawienia'  => now()->toDateString(),
            
            'status'            => 'NOWY',
        ]);

        $rezerwacja->update([
            'status' => 'POTWIERDZONA'
        ]);

        return response()->json($bilet, 201);
    });
}


  

    public function refund(Request $request)
    {
        $this->requireRole($request, ['KASJER', 'MENADZER', 'CLIENT']);

        $data = $request->validate([
            'numer_biletu' => 'required|string|exists:bilets,numer_biletu',
            'pin'          => 'required|string|min:6',
        ]);

        return DB::transaction(function () use ($data, $request) {

            $bilet = Bilet::with('rezerwacja')
                ->lockForUpdate()
                ->where('numer_biletu', $data['numer_biletu'])
                ->firstOrFail();

            if ($bilet->status !== 'OPLACONY') {
                abort(409, 'Tylko opłacony bilet może zostać zwrócony');
            }

            $role = strtoupper($request->header('X-User-Role'));
            $headerClientId = $request->header('X-Client-Id');

            
            if ($role === 'CLIENT') {
                if (!$headerClientId) {
                    abort(401, 'Brak identyfikatora klienta');
                }

                if ((int)$bilet->rezerwacja->klient_id !== (int)$headerClientId) {
                    abort(403, 'Nie możesz zwrócić cudzego biletu');
                }
            }

            $klient = Klient::findOrFail($bilet->rezerwacja->klient_id);

            if (!Hash::check($data['pin'], $klient->haslo)) {
                abort(403, 'Nieprawidłowy PIN klienta');
            }

            
            $platnosc = Platnosc::where('bilet_id', $bilet->id)
                ->lockForUpdate()
                ->orderByDesc('created_at')
                ->firstOrFail();

            Platnosc::create([
                'kwota'          => -abs($platnosc->kwota),
                'metoda'         => 'BLIK',          
                'data_platnosci' => now(),
                'bilet_id'       => $bilet->id,
                'klient_id'      => $klient->id,
            ]);

        
            if ($bilet->rezerwacja->miejsce) {
                $bilet->rezerwacja->miejsce->update([
                    'zajete' => false
                ]);
            }

            
            $bilet->update(['status' => 'ZWROCONY']);

            
            $bilet->rezerwacja->delete();
            return response()->json([
                'message'      => 'Zwrot biletu wykonany poprawnie',
                'numer_biletu' => $bilet->numer_biletu,
                'kwota'        => $platnosc->kwota,
            ]);
        });
    }










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



public function faktura(Request $request, $id)
{
    $this->requireRole($request, ['KASJER', 'MENADZER']);

    $bilet = Bilet::with([
        'rezerwacja.klient',
        'rezerwacja.miejsce.lot.trasa.lotniskoWylotu',
        'rezerwacja.miejsce.lot.trasa.lotniskoPrzylotu',
    ])->findOrFail($id);

    if ($bilet->status !== 'OPLACONY') {
        abort(409, 'Faktura dostępna tylko dla opłaconych biletów');
    }

    
    $rezerwacja = $bilet->rezerwacja;
    $lot = $rezerwacja?->miejsce?->lot;
    $trasa = $lot?->trasa;

    
    $platnosc = Platnosc::where('bilet_id', $bilet->id)
        ->orderByDesc('data_platnosci')
        ->first();

    if (!$platnosc) {
        abort(409, 'Brak płatności dla tego biletu');
    }

    $kwota = $platnosc->kwota;

    
    $pdf = Pdf::loadView('pdf.faktura', [
        'numer_faktury' => 'FV/' . now()->format('Ymd') . '/' . $bilet->id,
        'data'          => now()->toDateString(),

        'klient'        => $rezerwacja->klient,

        'lot'           => $lot,
        'trasa'         => $trasa,

        
        'kwota'         => $kwota
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
        if (!$klientId) {
            abort(401, 'Brak identyfikatora klienta');
        }

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
        $this->requireRole($request, ['CLIENT', 'KASJER']);

        $klientId = $request->header('X-Client-Id');
        if (!$klientId) {
            abort(401, 'Brak identyfikatora klienta');
        }

        return DB::transaction(function () use ($id, $klientId) {

            $bilet = Bilet::with([
                'rezerwacja.miejsce.lot.ceny'
            ])->lockForUpdate()->findOrFail($id);

            
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


            $kwota = null;

            if ($lot->ceny && $lot->ceny->count()) {

                $klasa = strtoupper(trim($miejsce->klasa));

                $cena = $lot->ceny->firstWhere('klasa', $klasa);

                if ($cena && $cena->cena !== null) {
                    $kwota = $cena->cena;
                }
            }

            
            if ($kwota === null) {
                abort(409, 'Brak ceny w bazie dla klasy miejsca');
            }


            $kwota = null;

            if ($lot->ceny && $lot->ceny->count()) {

                $klasa = strtoupper(trim($miejsce->klasa));

                $cena = $lot->ceny->firstWhere('klasa', $klasa);

                if ($cena && $cena->cena !== null) {
                    $kwota = $cena->cena;
                }
            }


            if ($kwota === null) {
                abort(409, 'Brak ceny w bazie dla klasy miejsca');
            }



            Platnosc::create([
                'kwota'          => $kwota,
                'metoda'         => 'BLIK',
                'status'         => 'OPLACONA',
                'data_platnosci' => now(),
                'bilet_id'       => $bilet->id,
                'klient_id'      => $klientId,
            ]);


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

    public function refundClient(Request $request)
    {
        $this->requireRole($request, ['CLIENT']);

        $data = $request->validate([
            'bilet_id' => 'required|integer|exists:bilets,id',
            'pin'      => 'required|string|min:6',
        ]);

        return DB::transaction(function () use ($data, $request) {

            $clientId = $request->header('X-Client-Id');
            if (!$clientId) {
                abort(401, 'Brak identyfikatora klienta');
            }

            $bilet = Bilet::with('rezerwacja.miejsce')
                ->lockForUpdate()
                ->findOrFail($data['bilet_id']);

            if ($bilet->status !== 'OPLACONY') {
                abort(409, 'Bilet nie jest opłacony lub został już zwrócony');
            }

            if ((int)$bilet->rezerwacja->klient_id !== (int)$clientId) {
                abort(403, 'To nie jest Twój bilet');
            }

            $klient = Klient::findOrFail($clientId);

            if (!Hash::check($data['pin'], $klient->haslo)) {
                abort(403, 'Nieprawidłowy PIN');
            }


            $platnosc = Platnosc::where('bilet_id', $bilet->id)
                ->orderByDesc('created_at')
                ->lockForUpdate()
                ->firstOrFail();


            Platnosc::create([
                'kwota'          => -abs($platnosc->kwota),
                'metoda'         => 'BLIK',
                'data_platnosci' => now(),
                'bilet_id'       => $bilet->id,
                'klient_id'      => $klient->id,
            ]);


            if ($bilet->rezerwacja->miejsce) {
                $bilet->rezerwacja->miejsce->update([
                    'zajete' => false
                ]);
            }

 
            $bilet->rezerwacja->delete();

            $bilet->update([
                'status' => 'ZWROCONY'
            ]);

            return response()->json([
                'message' => 'Zwrot wykonany poprawnie',
                'bilet_id' => $bilet->id,
            ]);
        });
    }


    public function show(Request $request, $id)
    {
        $this->requireRole($request, ['KASJER', 'MENADZER']);

        $bilet = Bilet::with([
            'rezerwacja.miejsce.lot.trasa.lotniskoWylotu',
            'rezerwacja.miejsce.lot.trasa.lotniskoPrzylotu',
        ])->findOrFail($id);

        return response()->json($bilet);
    }

}

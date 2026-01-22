<?php

namespace App\Http\Controllers;

use App\Models\Miejsce;
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
        $wygasle = Rezerwacja::where('status', 'OCZEKUJE')
            ->whereNotNull('wygasa_o')
            ->where('wygasa_o', '<', now())
            ->get();

        foreach ($wygasle as $r) {
            if ($r->miejsce) {
                $r->miejsce->update(['zajete' => false]);
            }

            $r->update([
                'status' => 'WYGASLA',
                'wygasa_o' => null
            ]);
        }

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

            $rezerwacja = Rezerwacja::create([
                'klient_id'       => $validated['klient_id'],
                'miejsce_id'      => $validated['miejsce_id'],
                'pracownik_id'    => $validated['pracownik_id'] ?? null,
                'status'          => 'OCZEKUJE',
                'data_rezerwacji' => now()->toDateString(),
                'wygasa_o'        => now()->addMinutes(15),
            ]);

            Miejsce::where('id', $validated['miejsce_id'])
                ->update(['zajete' => true]);

            return response()->json($rezerwacja, 201);
        });

    } catch (\Throwable $e) {

        if ($e instanceof ValidationException) {
            throw $e;
        }

        if ($e instanceof QueryException && $e->getCode() === '23000') {
            throw ValidationException::withMessages([
                'miejsce_id' => 'To miejsce zostało właśnie zajęte przez innego użytkownika',
            ]);
        }

        abort(500, 'Błąd serwera przy rezerwacji');
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
    public function zmienMiejsceKlient(Request $request)
{
    $this->requireRole($request, ['CLIENT']);

    $data = $request->validate([
        'rezerwacja_id'    => 'required|exists:rezerwacjes,id',
        'nowe_miejsce_id'  => 'required|exists:miejscas,id',
    ]);

    $clientId = $request->header('X-Client-Id');
    if (!$clientId) {
        abort(401, 'Brak identyfikatora klienta');
    }

    return DB::transaction(function () use ($data, $clientId) {

        $rezerwacja = Rezerwacja::with('miejsce')
            ->lockForUpdate()
            ->findOrFail($data['rezerwacja_id']);

        
        if ((int)$rezerwacja->klient_id !== (int)$clientId) {
            abort(403, 'To nie jest Twoja rezerwacja');
        }

        if ($rezerwacja->status !== 'POTWIERDZONA') {
            abort(409, 'Tylko potwierdzona rezerwacja może zmienić miejsce');
        }

        
        $rezerwacja->miejsce->update(['zajete' => false]);

        
        $noweMiejsce = Miejsce::lockForUpdate()->findOrFail($data['nowe_miejsce_id']);
        if ($noweMiejsce->zajete) {
            abort(409, 'Miejsce jest już zajęte');
        }

        $noweMiejsce->update(['zajete' => true]);

        $rezerwacja->update([
            'miejsce_id' => $noweMiejsce->id
        ]);

        return response()->json([
            'message' => 'Miejsce zmienione poprawnie'
        ]);
    });
}
public function zmienMiejsce(Request $request)
{
    $data = $request->validate([
        'rezerwacja_id'    => 'required|exists:rezerwacjes,id',
        'nowe_miejsce_id'  => 'required|exists:miejscas,id',
    ]);
    $role = strtoupper($request->header('X-User-Role'));

    if ($role === 'CLIENT') {
        $clientId = $request->header('X-Client-Id');

        $rezerwacjaCheck = Rezerwacja::where('id', $data['rezerwacja_id'])
            ->where('klient_id', $clientId)
            ->exists();

        if (!$rezerwacjaCheck) {
            abort(403, 'To nie jest Twoja rezerwacja');
        }
    }


    return DB::transaction(function () use ($data) {

        $rezerwacja = DB::table('rezerwacjes')
            ->where('id', $data['rezerwacja_id'])
            ->lockForUpdate()
            ->first();

        if (!$rezerwacja) {
            abort(404, 'Rezerwacja nie istnieje');
        }

        
        DB::table('miejscas')
            ->where('id', $rezerwacja->miejsce_id)
            ->update(['zajete' => false]);

        
        $nowe = DB::table('miejscas')
            ->where('id', $data['nowe_miejsce_id'])
            ->where('zajete', false)
            ->lockForUpdate()
            ->first();

        if (!$nowe) {
            abort(409, 'Miejsce jest już zajęte');
        }

        DB::table('miejscas')
            ->where('id', $data['nowe_miejsce_id'])
            ->update(['zajete' => true]);

        DB::table('rezerwacjes')
            ->where('id', $rezerwacja->id)
            ->update(['miejsce_id' => $data['nowe_miejsce_id']]);

        return response()->json(['message' => 'Miejsce zmienione']);
    });
}


}

<?php

namespace App\Http\Controllers;

use App\Models\Pracownik;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class PracownikController extends Controller
{

    private function requireRole(Request $request, array $roles): void
    {
        $role =
            $request->header('X-User-Role')
            ?? $request->header('X-Role')
            ?? $request->header('role')
            ?? $request->header('ROLE');

        if (!$role) {
            abort(403, 'Brak roli użytkownika');
        }

        if (!in_array(strtoupper($role), array_map('strtoupper', $roles))) {
            abort(403, 'Brak uprawnień');
        }
    }


    public function index(Request $request)
    {
        $this->requireRole($request, ['MENADZER']);

        return response()->json(
            Pracownik::orderBy('nazwisko')->get()
        );
    }


    public function store(Request $request)
    {
        $this->requireRole($request, ['MENADZER']);

        $data = $request->validate([
            'imie' => 'required|string|max:50',
            'nazwisko' => 'required|string|max:50',
            'pesel' => 'required|string|size:11|unique:pracowniks,pesel',
            'adres' => 'required|string|max:255',
            'telefon' => 'required|string|max:20',
            'email' => 'required|email|unique:pracowniks,email',

            'login' => 'required|string|max:50|unique:pracowniks,login',
            'haslo' => [
                'required',
                'string',
                'min:6',
                'regex:/[A-Z]/', // co najmniej 1 duża litera
                'regex:/[0-9]/', // co najmniej 1 cyfra
            ],


            'rola' => 'required|in:KASJER,MENADZER',
        ]);

        $data['haslo'] = Hash::make($data['haslo']);
        $data['status'] = true;
        $data['data_zatrudnienia'] = now()->toDateString();

        $pracownik = Pracownik::create($data);

        return response()->json($pracownik, 201);
    }


    public function update(Request $request, $id)
    {
        $this->requireRole($request, ['MENADZER']);

        $p = Pracownik::findOrFail($id);

        // 🔒 BLOKADA GŁÓWNEGO ADMINA
        if ($p->login === 'admin') {
            return response()->json([
                'message' => 'Nie można modyfikować głównego administratora'
            ], 403);
        }

       

        $data = $request->validate([
            'imie' => 'sometimes|string|max:50',
            'nazwisko' => 'sometimes|string|max:50',
            'adres' => 'sometimes|string|max:255',
            'telefon' => 'sometimes|string|max:20',

            'email' => 'sometimes|email|unique:pracowniks,email,' . $p->id,
            'login' => 'sometimes|string|max:50|unique:pracowniks,login,' . $p->id,

            'rola' => 'sometimes|in:KASJER,MENADZER',
            'haslo' => [
                'sometimes',
                'string',
                'min:6',
                'regex:/[A-Z]/', // co najmniej 1 duża litera
                'regex:/[0-9]/', // co najmniej 1 cyfra
            ],

        ]);

        if (!empty($data['haslo'])) {
            $data['haslo'] = Hash::make($data['haslo']);
        } else {
            unset($data['haslo']);
        }

        $p->update($data);

        return response()->json([
            'message' => 'Dane pracownika zaktualizowane',
            'pracownik' => $p
        ]);
    }


    public function toggleStatus(Request $request, $id)
    {
        $this->requireRole($request, ['MENADZER']);

        $p = Pracownik::findOrFail($id);

        // 🔒 BLOKADA GŁÓWNEGO ADMINA
        if ($p->login === 'admin') {
            return response()->json([
                'message' => 'Nie można zablokować głównego administratora'
            ], 403);
        }

        $p->status = !$p->status;
        $p->save();

        return response()->json([
            'message' => $p->status
                ? 'Konto odblokowane'
                : 'Konto zablokowane',
            'status' => (bool) $p->status
        ]);
    }
    

}

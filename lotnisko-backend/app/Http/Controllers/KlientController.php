<?php

namespace App\Http\Controllers;

use App\Models\Klient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class KlientController extends Controller
{
    protected function requireRole(Request $request, array $roles)
    {
        $role = strtoupper($request->header('X-User-Role'));

        if (!$role || !in_array($role, $roles)) {
            abort(403, 'Brak uprawnień');
        }
    }
    // GET /api/klienci
    public function index()
    {
        return response()->json(Klient::all());
    }
    
    // POST /api/klienci
    public function store(Request $request)
    {
        $validated = $request->validate([
            'imie' => 'required|string|max:50',
            'nazwisko' => 'required|string|max:50',
            'pesel' => 'required|string|size:11|unique:klients,pesel',
            'numer_telefonu' => 'required|string|size:9|unique:klients,numer_telefonu',
            'email' => 'required|email|unique:klients,email',
            'haslo' => 'required|string|min:6',
        ]);

        $validated['haslo'] = Hash::make($validated['haslo']);

        $klient = Klient::create($validated);

        return response()->json($klient, 201);
    }

    // GET /api/klienci/{id}
    public function show($id)
    {
        return response()->json(Klient::findOrFail($id));
    }
    public function profile(Request $request)
    {
        $this->requireRole($request, ['CLIENT']);

        $clientId = $request->header('X-Client-Id');

        $klient = Klient::findOrFail($clientId);

        return response()->json($klient);
    }
    public function updateProfile(Request $request)
    {
        $this->requireRole($request, ['CLIENT']);

        $clientId = $request->header('X-Client-Id');

        $request->validate([
            'email' => 'nullable|email',
            'numer_telefonu' => 'nullable|string|min:6',
            'current_password' => 'nullable|string',
            'new_password' => 'nullable|string|min:6',
        ]);

        $klient = Klient::findOrFail($clientId);

        if ($request->email !== null) {
            $klient->email = $request->email;
        }

        if ($request->numer_telefonu !== null) {
            $klient->numer_telefonu = $request->numer_telefonu;
        }

        // 🔐 zmiana hasła (jeśli podane)
        if ($request->current_password && $request->new_password) {
            if (!Hash::check($request->current_password, $klient->haslo)) {
                return response()->json([
                    'message' => 'Aktualne hasło jest niepoprawne'
                ], 403);
            }

            $klient->haslo = Hash::make($request->new_password);
        }

        $klient->save();

        return response()->json([
            'message' => 'Profil zaktualizowany'
        ]);
    }
    

}

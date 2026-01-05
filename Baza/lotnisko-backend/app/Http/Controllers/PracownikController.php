<?php

namespace App\Http\Controllers;

use App\Models\Pracownik;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class PracownikController extends Controller
{
    /**
     * 🔐 AUTORYZACJA RÓL (zamiennik middleware)
     */
    private function requireRole(Request $request, array $roles): void
    {
        // obsługa różnych nagłówków (frontend + postman)
        $role =
            $request->header('X-User-Role')
            ?? $request->header('X-Role')
            ?? $request->header('role')
            ?? $request->header('ROLE');

        if (!$role) {
            abort(401, 'Brak roli użytkownika');
        }

        if (!in_array(strtoupper($role), $roles)) {
            abort(403, 'Brak uprawnień');
        }
    }

    /**
     * GET /api/pracownicy
     * 👑 tylko MENADŻER
     */
    public function index(Request $request)
    {
        $this->requireRole($request, ['MENADZER']);
        return Pracownik::all();
    }



    /**
     * POST /api/pracownicy
     * 👑 tylko MENADŻER
     */
    public function store(Request $request)
    {
        $this->requireRole($request, ['MENADZER']);

        $validated = $request->validate([
            'imie' => 'required|string|max:50',
            'nazwisko' => 'required|string|max:50',
            'pesel' => 'required|string|size:11|unique:pracowniks,pesel',
            'adres' => 'required|string|max:255',
            'telefon' => 'required|string|max:20',
            'email' => 'required|email|unique:pracowniks,email',

            'login' => 'required|string|max:50|unique:pracowniks,login',
            'haslo' => 'required|string|min:6',

            'data_zatrudnienia' => 'required|date',
            'rola' => 'required|in:KASJER,MENADZER',
        ]);

        // 🔐 hash hasła
        $validated['haslo'] = Hash::make($validated['haslo']);

        $pracownik = Pracownik::create($validated);

        return response()->json($pracownik, 201);
    }
}

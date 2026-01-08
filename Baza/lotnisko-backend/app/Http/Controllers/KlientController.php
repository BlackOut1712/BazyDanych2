<?php

namespace App\Http\Controllers;

use App\Models\Klient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class KlientController extends Controller
{
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
            'numer_telefonu' => 'required|string|max:20',
            'email' => 'required|email|unique:klients,email',
            'login' => 'required|string|max:50|unique:klients,login',
            'haslo' => 'required|string|min:6'
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
}

<?php

namespace App\Http\Controllers;

use App\Models\Klient;
use App\Models\Pracownik;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'identifier' => 'required|string',
            'secret' => 'required|string',
        ]);

        $identifier = $request->identifier;
        $secret = $request->secret;

        // =========================
        // 👉 KLIENT (EMAIL + HASŁO)
        // =========================
        if (filter_var($identifier, FILTER_VALIDATE_EMAIL)) {

            $klient = Klient::where('email', $identifier)->first();

            if (!$klient || !Hash::check($secret, $klient->haslo)) {
                return response()->json([
                    'message' => 'Niepoprawny email lub hasło'
                ], 401);
            }

            return response()->json([
                'role' => 'client',
                'user' => $klient,
            ]);
        }

        // =========================
        // 👉 PRACOWNIK (LOGIN + PIN)
        // =========================
        $pracownik = Pracownik::where('login', $identifier)->first();

        if (!$pracownik || !Hash::check($secret, $pracownik->haslo)) {
            return response()->json([
                'message' => 'Niepoprawny login lub hasło'
            ], 401);
        }

        return response()->json([
            'role' => $pracownik->rola, // admin / kasjer
            'user' => $pracownik,
        ]);
    }
}

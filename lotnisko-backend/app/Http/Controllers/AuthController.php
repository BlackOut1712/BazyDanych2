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

        // Klient - EMAIL I PIN
        if (filter_var($identifier, FILTER_VALIDATE_EMAIL)) {

            $klient = Klient::where('email', $identifier)->first();

            if (!$klient || !Hash::check($secret, $klient->haslo)) {
                return response()->json([
                    'message' => 'Niepoprawny email lub hasło'
                ], 401);
            }

            return response()->json([
                'role' => 'CLIENT', 
                'user' => $klient,
            ]);
        }

        // PRACOWNIK - LOGIN I HASLO
        $pracownik = Pracownik::where('login', $identifier)->first();

        if (!$pracownik || !Hash::check($secret, $pracownik->haslo)) {
            return response()->json([
                'message' => 'Niepoprawny login lub hasło'
            ], 401);
        }

        if ((int) $pracownik->status !== 1) {
            return response()->json([
                'message' => 'Konto pracownika jest zablokowane'
            ], 403);
        }

        return response()->json([
            'role' => strtoupper($pracownik->rola), // KASJER / MENADZER
            'user' => $pracownik,
        ]);
    }
}

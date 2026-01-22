<?php

namespace App\Http\Controllers;

use App\Models\Trasa;
use Illuminate\Http\Request;

class TrasaController extends Controller
{
    
    public function index()
    {
        return response()->json(
            Trasa::with(['lotniskoWylotu', 'lotniskoPrzylotu'])->get()
        );
    }

    
    public function store(Request $request)
    {
        $data = $request->validate([
            'lotnisko_wylotu_id' => 'required|exists:lotniska,id',
            'lotnisko_przylotu_id' => 'required|exists:lotniska,id|different:lotnisko_wylotu_id',
            'czas_lotu' => 'required|integer|min:1',
        ]);

        $trasa = Trasa::create($data);

        return response()->json($trasa, 201);
    }

    
    public function show($id)
    {
        return response()->json(
            Trasa::with(['lotniskoWylotu', 'lotniskoPrzylotu'])->findOrFail($id)
        );
    }

    
    public function destroy($id)
    {
        Trasa::findOrFail($id)->delete();

        return response()->json([
            'message' => 'Trasa usunięta'
        ]);
    }
}

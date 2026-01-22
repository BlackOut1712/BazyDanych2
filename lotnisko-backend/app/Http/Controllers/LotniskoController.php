<?php

namespace App\Http\Controllers;

use App\Models\Lotnisko;
use Illuminate\Http\Request;

class LotniskoController extends Controller
{
    
    public function index()
    {
        return response()->json(Lotnisko::all());
    }

    
    public function store(Request $request)
    {
        $data = $request->validate([
            'nazwa' => 'required|string|max:255',
            'kod_iata' => 'required|string|size:3|unique:lotniska,kod_iata',
            'miasto' => 'required|string|max:50',
            'kraj' => 'required|string|max:50',
        ]);

        $lotnisko = Lotnisko::create($data);

        return response()->json($lotnisko, 201);
    }

    
    public function show($id)
    {
        return response()->json(
            Lotnisko::findOrFail($id)
        );
    }

    
    public function update(Request $request, $id)
    {
        $lotnisko = Lotnisko::findOrFail($id);

        $data = $request->validate([
            'nazwa' => 'sometimes|string|max:255',
            'kod_iata' => 'sometimes|string|size:3|unique:lotniska,kod_iata,' . $lotnisko->id,
            'miasto' => 'sometimes|string|max:50',
            'kraj' => 'sometimes|string|max:50',
        ]);

        $lotnisko->update($data);

        return response()->json($lotnisko);
    }

    // DELETE /api/lotniska/{id}
    public function destroy($id)
    {
        Lotnisko::findOrFail($id)->delete();

        return response()->json([
            'message' => 'Lotnisko usunięte'
        ]);
    }
}

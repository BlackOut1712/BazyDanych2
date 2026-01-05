<?php

namespace App\Http\Controllers;

use App\Models\Samolot;
use Illuminate\Http\Request;

class SamolotController extends Controller
{
    public function index()
    {
        return Samolot::with('miejsca')->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'model' => 'required|string|max:100',
            'liczba_miejsc' => 'required|integer|min:1'
        ]);

        return Samolot::create($data);
    }
    public function update(Request $request, $id)
    {
        $samolot = Samolot::findOrFail($id);

        $data = $request->validate([
            'model' => 'required|string|max:255',
            'liczba_miejsc' => 'required|integer|min:1'
        ]);

        $samolot->update($data);

        return response()->json($samolot);
    }

}

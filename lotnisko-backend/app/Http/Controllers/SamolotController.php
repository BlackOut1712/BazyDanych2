<?php

namespace App\Http\Controllers;

use App\Models\Samolot;
use Illuminate\Http\Request;

class SamolotController extends Controller
{

    public function index()
    {
        return Samolot::orderBy('model')->get();
    }


    public function store(Request $request)
    {
        $data = $request->validate([
            'model' => 'required|string|max:100',
            'liczba_miejsc' => 'required|integer|min:1',
        ]);

        $data['status'] = true;

        return response()->json(
            Samolot::create($data),
            201
        );
    }


    public function update(Request $request, $id)
    {
        $samolot = Samolot::findOrFail($id);

        $data = $request->validate([
            'model' => 'sometimes|string|max:255',
            'liczba_miejsc' => 'sometimes|integer|min:1',
            'status' => 'sometimes|boolean',
        ]);

        if (array_key_exists('status', $data)) {
            $data['status'] = filter_var($data['status'], FILTER_VALIDATE_BOOLEAN);
        }

        $samolot->update($data);

        return response()->json($samolot);
    }
}

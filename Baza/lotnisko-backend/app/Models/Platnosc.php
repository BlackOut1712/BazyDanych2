<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Platnosc extends Model
{
    protected $table = 'platnosci';

    protected $fillable = [
        'kwota',
        'metoda',
        'data_platnosci',
        'klient_id',
        'bilet_id',
    ];

    public function bilet()
    {
        return $this->belongsTo(Bilet::class);
    }
}

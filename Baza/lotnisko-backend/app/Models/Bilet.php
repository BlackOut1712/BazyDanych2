<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Bilet extends Model
{
    protected $table = 'bilets';

    protected $fillable = [
        'imie_pasazera',
        'nazwisko_pasazera',
        'pesel_pasazera',
        'rezerwacja_id',
        'lot_id',
        'miejsce_id',
        'numer_biletu',
        'data_wystawienia',
        'status',
    ];

    public function rezerwacja()
    {
        return $this->belongsTo(Rezerwacja::class);
    }

    public function miejsce()
    {
        return $this->belongsTo(Miejsce::class);
    }

}

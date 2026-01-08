<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Bilet extends Model
{
    protected $table = 'bilets';

    protected $fillable = [
        'numer_biletu',

        'imie_pasazera',
        'nazwisko_pasazera',
        'pesel_pasazera',

        'rezerwacja_id',
        'lot_id',
        'miejsce_id',

        'data_wystawienia',
        'status',
    ];

    protected $casts = [
        'data_wystawienia' => 'date',
    ];

    /* ======================================================
       RELACJE
    ====================================================== */

    public function rezerwacja()
    {
        return $this->belongsTo(Rezerwacja::class);
    }

    public function miejsce()
    {
        return $this->belongsTo(Miejsce::class);
    }

    public function lot()
    {
        return $this->belongsTo(Lot::class);
    }

    public function platnosci()
    {
        return $this->hasMany(Platnosc::class);
    }
}

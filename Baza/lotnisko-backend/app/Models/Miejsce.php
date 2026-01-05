<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Miejsce extends Model
{
    
    protected $table = 'miejscas';

    protected $fillable = [
        'numer',
        'klasa',
        'okno',
        'przejscie',
        'samolot_id',
    ];

    protected $casts = [
        'okno' => 'boolean',
        'przejscie' => 'boolean',
    ];

    /* ============================
       RELACJE
       ============================ */

    // Miejsce należy do jednego samolotu
    public function samolot()
    {
        return $this->belongsTo(Samolot::class);
    }

    // Jedno miejsce może mieć wiele rezerwacji (historia)
    public function rezerwacje()
    {
        return $this->hasMany(Rezerwacja::class);
    }

}

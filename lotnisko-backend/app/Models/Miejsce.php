<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Miejsce extends Model
{
    protected $table = 'miejscas';

    protected $fillable = [
        'lot_id',
        'numer_miejsca',
        'klasa',
        'okno',
        'przejscie',
    ];

    protected $casts = [
        'okno'      => 'boolean',
        'przejscie' => 'boolean',
    ];

    // Miejsce należy do jednego LOTU
    public function lot()
    {
        return $this->belongsTo(Lot::class);
    }

    // Jedno miejsce może mieć MAKSYMALNIE jedną rezerwację
    public function rezerwacja()
    {
        return $this->hasOne(Rezerwacja::class);
    }
}

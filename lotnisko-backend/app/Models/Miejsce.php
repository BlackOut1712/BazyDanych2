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


    public function lot()
    {
        return $this->belongsTo(Lot::class);
    }

    
    public function rezerwacja()
    {
        return $this->hasOne(Rezerwacja::class);
    }
}

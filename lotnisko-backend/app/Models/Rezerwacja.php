<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Rezerwacja extends Model
{
    protected $table = 'rezerwacjes';

    protected $fillable = [
        'klient_id',
        'miejsce_id',
        'pracownik_id',
        'status',
        'data_rezerwacji',
        'wygasa_o',
    ];

    protected $casts = [
        'wygasa_o' => 'datetime',
    ];

    public function klient()
    {
        return $this->belongsTo(Klient::class);
    }

    public function miejsce()
    {
        return $this->belongsTo(Miejsce::class);
    }

    public function pracownik()
    {
        return $this->belongsTo(Pracownik::class);
    }
    public function lot()
    {
        return $this->belongsTo(Lot::class);
    }

}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Lot extends Model
{
    protected $fillable = [
        'data',
        'godzina',
        'status',
        'trasa_id',
        'samolot_id',
    ];

    protected $casts = [
        'data' => 'date',
    ];

    /* =========================
       🔥 DODANE – APPENDS
    ========================= */
    protected $appends = ['cena'];

    /* =========================
       RELACJE PODSTAWOWE
    ========================= */

    public function trasa()
    {
        return $this->belongsTo(Trasa::class);
    }

    public function samolot()
    {
        return $this->belongsTo(Samolot::class);
    }

    public function miejsca()
    {
        return $this->hasMany(Miejsce::class);
    }
    
    public function rezerwacje()
    {
        return $this->hasManyThrough(
            Rezerwacja::class,
            Miejsce::class,
            'lot_id',
            'miejsce_id',
            'id',
            'id'
        );
    }

    /* =========================
       ➕ CENY LOTU
    ========================= */

    public function ceny()
    {
        return $this->hasMany(LotCena::class);
    }

    public function cenaEconomy()
    {
        return $this->hasOne(LotCena::class)
            ->where('klasa', 'ECONOMY');
    }

    public function cenaBusiness()
    {
        return $this->hasOne(LotCena::class)
            ->where('klasa', 'BUSINESS');
    }

    /* =========================
       GETTERY
    ========================= */

    public function getCenaEconomyAttribute()
    {
        return $this->cenaEconomy?->cena;
    }

    public function getCenaBusinessAttribute()
    {
        return $this->cenaBusiness?->cena;
    }

    /* =========================
       🔥 NAJWAŻNIEJSZE – BRAKUJĄCY ACCESSOR
       używany przez LotController
    ========================= */

    public function getCenaAttribute()
    {
        // jeżeli relacja nie została załadowana
        if (!$this->relationLoaded('ceny')) {
            return null;
        }

        // najniższa cena (do list, "od xxx zł")
        return $this->ceny->min('cena');
    }
}

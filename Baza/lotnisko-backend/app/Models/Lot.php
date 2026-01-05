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
    ];

    public function trasa()
    {
    return $this->belongsTo(Trasa::class);
    }
    public function samolot()
    {
        return $this->belongsTo(Samolot::class);
    }
}

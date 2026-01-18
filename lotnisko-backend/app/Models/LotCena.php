<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LotCena extends Model
{
    protected $table = 'lot_ceny';

    protected $fillable = [
        'lot_id',
        'klasa',
        'cena',
    ];

    public function lot()
    {
        return $this->belongsTo(Lot::class);
    }
}

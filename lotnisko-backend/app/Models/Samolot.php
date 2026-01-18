<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Samolot extends Model
{
    protected $table = 'samolots';

    protected $fillable = [
        'model',
        'liczba_miejsc',
        'status',
    ];

    public function miejsca()
    {
        return $this->hasMany(Miejsce::class);
    }
}

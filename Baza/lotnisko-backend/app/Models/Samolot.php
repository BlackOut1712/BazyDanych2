<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Samolot extends Model
{
    protected $fillable = ['model', 'liczba_miejsc'];

    public function miejsca()
    {
        return $this->hasMany(Miejsce::class);
    }
}

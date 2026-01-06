<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Samolot extends Model
{
    // 👈 JAWNIE OKREŚLONA TABELA
    protected $table = 'samolots';

    // 👈 MASS ASSIGNMENT (KLUCZ DO UPDATE)
    protected $fillable = [
        'model',
        'liczba_miejsc',
        'status',
    ];

    // 👈 RELACJA Z MIEJSCAMI
    public function miejsca()
    {
        return $this->hasMany(Miejsce::class);
    }
}

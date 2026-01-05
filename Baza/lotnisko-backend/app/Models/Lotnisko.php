<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Lotnisko extends Model
{
    protected $table = 'lotniska';

    protected $fillable = [
        'nazwa',
        'kod_iata',
        'miasto',
        'kraj',
    ];
}

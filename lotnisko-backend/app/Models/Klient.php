<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Klient extends Model
{
    use HasFactory;

    protected $table = 'klients';

    protected $fillable = [
        'imie',
        'nazwisko',
        'pesel',
        'numer_telefonu',
        'email',
        'haslo',
    ];

    protected $hidden = [
        'haslo',
    ];
}

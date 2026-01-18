<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pracownik extends Model
{
    protected $table = 'pracowniks';

    protected $fillable = [
        'imie',
        'nazwisko',
        'pesel',
        'adres',
        'telefon',
        'email',
        'login',
        'haslo',
        'data_zatrudnienia',
        'data_zwolnienia',
        'rola',
    ];

    protected $hidden = [
        'haslo',
    ];
}

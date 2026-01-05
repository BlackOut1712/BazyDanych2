<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Trasa extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'lotnisko_wylotu_id',
        'lotnisko_przylotu_id',
        'czas_lotu',
    ];

    public function lotniskoWylotu()
    {
        return $this->belongsTo(Lotnisko::class, 'lotnisko_wylotu_id');
    }

    public function lotniskoPrzylotu()
    {
        return $this->belongsTo(Lotnisko::class, 'lotnisko_przylotu_id');
    }
}

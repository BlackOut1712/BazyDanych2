<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Lotnisko;

class LotniskoSeeder extends Seeder
{
    public function run(): void
    {
        Lotnisko::create([
            'nazwa' => 'Lotnisko Chopina',
            'kod_iata' => 'WAW',
            'miasto' => 'Warszawa',
            'kraj' => 'Polska',
        ]);

        Lotnisko::create([
            'nazwa' => 'Narita International Airport',
            'kod_iata' => 'NRT',
            'miasto' => 'Tokyo',
            'kraj' => 'Japonia',
        ]);
    }
}

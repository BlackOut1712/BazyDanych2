<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Pracownik;
use Illuminate\Support\Facades\Hash;

class PracownikSeeder extends Seeder
{
    public function run(): void
    {
        Pracownik::create([
            'imie' => 'Jan',
            'nazwisko' => 'Kowalski',
            'pesel' => '90010112345',
            'adres' => 'Warszawa',
            'telefon' => '500600700',
            'email' => 'kasjer@lotnisko.pl',
            'login' => 'kasjer',
            'haslo' => Hash::make('kasjer123'),
            'data_zatrudnienia' => now(),
            'rola' => 'KASJER',
        ]);

        Pracownik::create([
            'imie' => 'Anna',
            'nazwisko' => 'Nowak',
            'pesel' => '88050554321',
            'adres' => 'Kraków',
            'telefon' => '600700800',
            'email' => 'menadzer@lotnisko.pl',
            'login' => 'menadzer',
            'haslo' => Hash::make('menadzer123'),
            'data_zatrudnienia' => now(),
            'rola' => 'MENADZER',
        ]);
    }
}

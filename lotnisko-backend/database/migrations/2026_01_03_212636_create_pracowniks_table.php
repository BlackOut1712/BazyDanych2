<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('pracowniks', function (Blueprint $table) {
            $table->id();


            $table->string('imie', 50);
            $table->string('nazwisko', 50);
            $table->string('pesel', 11)->unique();
            $table->string('adres', 255);
            $table->string('telefon', 20);
            $table->string('email')->unique();


            $table->string('login', 50)->unique();
            $table->string('haslo');


            $table->date('data_zatrudnienia');
            $table->date('data_zwolnienia')->nullable();

           
            $table->enum('rola', ['KASJER', 'MENADZER']);

           
            $table->boolean('status')->default(true);

            $table->timestamps();
        });
    }

    
    public function down(): void
    {
        Schema::dropIfExists('pracowniks');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('bilets', function (Blueprint $table) {
            $table->id();

            
            $table->string('imie_pasazera', 100);
            $table->string('nazwisko_pasazera', 100);
            $table->string('pesel_pasazera', 11);

            
            $table->foreignId('rezerwacja_id')
                ->constrained('rezerwacjes')
                ->cascadeOnDelete();

            $table->foreignId('lot_id')
                ->constrained('lots')
                ->cascadeOnDelete();

            $table->foreignId('miejsce_id')
                ->constrained('miejscas')
                ->cascadeOnDelete();

           
            $table->string('numer_biletu', 20)->unique();

            
            $table->date('data_wystawienia');

            
            $table->string('status', 20)->default('NOWY');

            
            $table->unique(['lot_id', 'miejsce_id']);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bilets');
    }
};

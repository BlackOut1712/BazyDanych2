<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('bilets', function (Blueprint $table) {
            $table->id();

            // dane pasażera
            $table->string('imie_pasazera', 100);
            $table->string('nazwisko_pasazera', 100);
            $table->string('pesel_pasazera', 11);

            // powiązania
            $table->foreignId('rezerwacja_id')
                ->constrained('rezerwacjes')
                ->cascadeOnDelete();

            $table->foreignId('lot_id')
                ->constrained('lots')
                ->cascadeOnDelete();

            $table->foreignId('miejsce_id')
                ->constrained('miejscas')
                ->cascadeOnDelete();

            // identyfikacja biletu
            $table->string('numer_biletu', 20)->unique();

            // data wystawienia
            $table->date('data_wystawienia');

            // status: NOWY / OPLACONY / ZWROCONY
            $table->string('status', 20)->default('NOWY');

            // jedno miejsce tylko raz na dany lot
            $table->unique(['lot_id', 'miejsce_id']);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bilets');
    }
};

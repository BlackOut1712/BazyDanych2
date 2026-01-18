<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('miejscas', function (Blueprint $table) {
            $table->id();

            // FK do LOTU (KLUCZOWE)
            $table->foreignId('lot_id')
                ->constrained('lots')
                ->cascadeOnDelete();

            // numer miejsca np. 12A
            $table->string('numer_miejsca', 5);

            // ECONOMY / BUSINESS / FIRST
            $table->string('klasa', 20);

            // czy przy oknie / przejściu
            $table->boolean('okno')->default(false);
            $table->boolean('przejscie')->default(false);

            $table->timestamps();

            // jedno miejsce o danym numerze tylko raz w danym locie
            $table->unique(['lot_id', 'numer_miejsca']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('miejscas');
    }
};

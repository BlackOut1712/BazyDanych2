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

            // numer miejsca np. 12A
            $table->string('numer', 5);

            // ECONOMY / BUSINESS itp.
            $table->string('klasa', 20);

            // czy przy oknie / przejściu
            $table->boolean('okno')->default(false);
            $table->boolean('przejscie')->default(false);

            // FK do samolotu
            $table->foreignId('samolot_id')
                ->constrained('samolots')
                ->cascadeOnDelete();

            $table->timestamps();

            // 🔒 jedno miejsce (np. 12A) tylko raz w danym samolocie
            $table->unique(['samolot_id', 'numer']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('miejscas');
    }
};

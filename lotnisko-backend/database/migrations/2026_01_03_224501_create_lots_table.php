<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lots', function (Blueprint $table) {
            $table->id();

            // data i godzina lotu
            $table->date('data');
            $table->time('godzina');

            // status lotu
            // AKTYWNY | ODWOLANY | ZAKONCZONY
            $table->string('status', 20)->default('AKTYWNY');

            // trasa lotu
            $table->foreignId('trasa_id')
                ->constrained('trasas')
                ->cascadeOnDelete();

            // samolot wykonujący lot (KLUCZOWE!)
            $table->foreignId('samolot_id')
                ->constrained('samolots')
                ->restrictOnDelete();

            // created_at / updated_at
            $table->timestamps();

            // (opcjonalnie) indeks przyspieszający zapytania
            $table->index(['data', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lots');
    }
};

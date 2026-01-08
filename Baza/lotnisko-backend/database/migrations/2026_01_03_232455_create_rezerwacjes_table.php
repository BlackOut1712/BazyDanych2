<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('rezerwacjes', function (Blueprint $table) {
            $table->id();

            // data utworzenia rezerwacji (czytelna biznesowo)
            $table->date('data_rezerwacji')
                  ->default(DB::raw('CURRENT_DATE'));

            // status rezerwacji
            $table->string('status', 20)
                  ->default('OCZEKUJE');

            // czas wygaśnięcia rezerwacji
            $table->timestamp('wygasa_o')->nullable();

            // klient
            $table->foreignId('klient_id')
                  ->constrained('klients')
                  ->cascadeOnDelete();

            // lot
            $table->foreignId('lot_id')
                  ->constrained('lots')
                  ->cascadeOnDelete();

            // miejsce
            $table->foreignId('miejsce_id')
                  ->constrained('miejscas')
                  ->restrictOnDelete();

            // pracownik (kasjer / menadżer)
            $table->foreignId('pracownik_id')
                  ->nullable()
                  ->constrained('pracowniks')
                  ->nullOnDelete();

            //jedno miejsce tylko raz na dany lot
            $table->unique(['lot_id', 'miejsce_id']);

            // created_at / updated_at
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rezerwacjes');
    }
};

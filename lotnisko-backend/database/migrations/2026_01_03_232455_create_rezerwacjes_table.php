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

            // data utworzenia rezerwacji
            $table->date('data_rezerwacji')
                  ->default(DB::raw('CURRENT_DATE'));

            // status
            $table->string('status', 20)
                  ->default('OCZEKUJE');

            // czas wygaśnięcia
            $table->timestamp('wygasa_o')->nullable();

            // klient
            $table->foreignId('klient_id')
                  ->constrained('klients')
                  ->cascadeOnDelete();

            // miejsce (miejsce już zna lot)
            $table->foreignId('miejsce_id')
                  ->constrained('miejscas')
                  ->restrictOnDelete();

            // pracownik
            $table->foreignId('pracownik_id')
                  ->nullable()
                  ->constrained('pracowniks')
                  ->nullOnDelete();

            // JEDNO MIEJSCE = JEDNA REZERWACJA
            $table->unique('miejsce_id');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rezerwacjes');
    }
};

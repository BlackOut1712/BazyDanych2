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

            $table->date('data_rezerwacji')->default(DB::raw('CURRENT_DATE'));
            $table->string('status', 20)->default('OCZEKUJE');

            $table->timestamp('wygasa_o')->nullable(); // ⏱ timeout

            $table->foreignId('klient_id')
                ->constrained('klients')
                ->cascadeOnDelete();

            $table->foreignId('lot_id')
                ->constrained('lots')
                ->cascadeOnDelete();

            $table->foreignId('miejsce_id')
                ->constrained('miejscas')
                ->restrictOnDelete();

            $table->foreignId('pracownik_id')
                ->nullable()
                ->constrained('pracowniks')
                ->nullOnDelete();

            // 🔒 jedno miejsce tylko raz na dany lot
            $table->unique(['lot_id', 'miejsce_id']);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rezerwacjes');
    }
};

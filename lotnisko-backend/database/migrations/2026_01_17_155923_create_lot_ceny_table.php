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
        Schema::create('lot_ceny', function (Blueprint $table) {
            $table->id();

            // powiązanie z lotem
            $table->foreignId('lot_id')
                ->constrained('lots')
                ->cascadeOnDelete();

            // klasa miejsca
            $table->enum('klasa', ['ECONOMY', 'BUSINESS']);

            // cena dla danej klasy i lotu
            $table->decimal('cena', 8, 2);

            $table->timestamps();

            // 🔒 jedna cena na jedną klasę w danym locie
            $table->unique(['lot_id', 'klasa']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lot_ceny');
    }
};

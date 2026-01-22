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

            
            $table->foreignId('lot_id')
                ->constrained('lots')
                ->cascadeOnDelete();

           
            $table->enum('klasa', ['ECONOMY', 'BUSINESS']);

            
            $table->decimal('cena', 8, 2);

            $table->timestamps();

            
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

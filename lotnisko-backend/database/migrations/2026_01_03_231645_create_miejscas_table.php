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

            
            $table->foreignId('lot_id')
                ->constrained('lots')
                ->cascadeOnDelete();

            
            $table->string('numer_miejsca', 5);

            
            $table->string('klasa', 20);

            
            $table->boolean('okno')->default(false);
            $table->boolean('przejscie')->default(false);

            $table->timestamps();

            
            $table->unique(['lot_id', 'numer_miejsca']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('miejscas');
    }
};

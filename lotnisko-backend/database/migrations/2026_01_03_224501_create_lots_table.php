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

            
            $table->date('data');
            $table->time('godzina');

            
            $table->string('status', 20)->default('AKTYWNY');

           
            $table->foreignId('trasa_id')
                ->constrained('trasas')
                ->cascadeOnDelete();

           
            $table->foreignId('samolot_id')
                ->constrained('samolots')
                ->restrictOnDelete();

            
            $table->timestamps();

            
            $table->index(['data', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lots');
    }
};

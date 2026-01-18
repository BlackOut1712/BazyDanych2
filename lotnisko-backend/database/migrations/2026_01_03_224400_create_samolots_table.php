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
        Schema::create('samolots', function (Blueprint $table) {
            $table->id();

            // dane samolotu
            $table->string('model', 100);
            $table->integer('liczba_miejsc');

            // STATUS SAMOLOTU
            // true  = AKTYWNY
            // false = NIEAKTYWNY
            $table->boolean('status')->default(true);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('samolots');
    }
};

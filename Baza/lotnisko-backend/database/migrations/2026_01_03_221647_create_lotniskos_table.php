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
        Schema::create('lotniska', function (Blueprint $table) {
            $table->id();

            $table->string('nazwa', 255);
            $table->string('kod_iata', 3)->unique();
            $table->string('miasto', 50);
            $table->string('kraj', 50);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lotniska');
    }
};

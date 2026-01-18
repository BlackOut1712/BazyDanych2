<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('klients', function (Blueprint $table) {
            $table->id();

            $table->string('imie', 255);
            $table->string('nazwisko', 255);

            $table->string('pesel', 11)->unique();
            $table->string('numer_telefonu', 20)->nullable();

            $table->string('email', 255)->unique();
            $table->string('login', 50)->unique();
            $table->string('haslo');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('klients');
    }
};

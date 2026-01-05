<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('platnosci', function (Blueprint $table) {
            $table->id();

            $table->integer('kwota');
            $table->string('metoda', 30);
            $table->date('data_platnosci');

            $table->foreignId('klient_id')
                ->constrained('klients')
                ->cascadeOnDelete();

            $table->foreignId('bilet_id')
                ->constrained('bilets')
                ->cascadeOnDelete()
                ->unique();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('platnosci');
    }
};

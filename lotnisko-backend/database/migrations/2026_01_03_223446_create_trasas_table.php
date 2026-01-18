<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('trasas', function (Blueprint $table) {
            $table->id();

            $table->foreignId('lotnisko_wylotu_id')
                ->constrained('lotniska')
                ->cascadeOnDelete();

            $table->foreignId('lotnisko_przylotu_id')
                ->constrained('lotniska')
                ->cascadeOnDelete();

            $table->integer('czas_lotu'); // w minutach

            $table->timestamps();

            $table->unique(['lotnisko_wylotu_id', 'lotnisko_przylotu_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('trasas');
    }
};

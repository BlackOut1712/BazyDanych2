<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('platnosci', function (Blueprint $table) {
            
            $table->decimal('kwota', 10, 2)->change();

            
            $table->string('metoda', 20)->change();
        });
    }

    public function down(): void
    {
        Schema::table('platnosci', function (Blueprint $table) {
            
            $table->integer('kwota')->change();
            $table->integer('metoda')->change();
        });
    }
};

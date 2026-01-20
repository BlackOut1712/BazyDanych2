<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('platnosci', function (Blueprint $table) {
            // kwota: z INTEGER → NUMERIC(10,2)
            $table->decimal('kwota', 10, 2)->change();

            // metoda: upewniamy się, że to string
            $table->string('metoda', 20)->change();
        });
    }

    public function down(): void
    {
        Schema::table('platnosci', function (Blueprint $table) {
            // rollback (jeśli naprawdę potrzebny)
            $table->integer('kwota')->change();
            $table->integer('metoda')->change();
        });
    }
};

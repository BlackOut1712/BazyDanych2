<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('klients', function (Blueprint $table) {

            
            if (Schema::hasColumn('klients', 'login')) {
                $table->dropColumn('login');
            }

            
            if (!Schema::hasColumn('klients', 'numer_telefonu')) {
                $table->string('numer_telefonu', 9)->unique()->after('pesel');
            }
        });
    }

    public function down(): void
    {
        Schema::table('klients', function (Blueprint $table) {

            if (!Schema::hasColumn('klients', 'login')) {
                $table->string('login')->unique();
            }

            if (Schema::hasColumn('klients', 'numer_telefonu')) {
                $table->dropColumn('numer_telefonu');
            }
        });
    }
};

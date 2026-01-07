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
        Schema::table('rezerwacjes', function (Blueprint $table) {
            if (!Schema::hasColumn('rezerwacjes', 'wygasa_o')) {
                $table->timestamp('wygasa_o')->nullable()->after('status');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('rezerwacjes', function (Blueprint $table) {
            if (Schema::hasColumn('rezerwacjes', 'wygasa_o')) {
                $table->dropColumn('wygasa_o');
            }
        });
    }
};

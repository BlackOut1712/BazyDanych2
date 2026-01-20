// MIGRACJA – DODAJ KOLUMNĘ, KTÓREJ UŻYWASZ (czy_zajete)

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('miejscas', function (Blueprint $table) {
            $table->boolean('czy_zajete')->default(false);
        });
    }

    public function down(): void
    {
        Schema::table('miejscas', function (Blueprint $table) {
            $table->dropColumn('czy_zajete');
        });
    }
};

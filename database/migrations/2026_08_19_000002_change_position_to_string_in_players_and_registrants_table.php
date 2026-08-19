<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Support all futsal and football position terms (GK, Anchor, Flank, Pivot, DEF, MID, FWD) without truncation
        try {
            DB::statement("ALTER TABLE `players` MODIFY COLUMN `position` VARCHAR(50) NOT NULL DEFAULT 'Flank'");
        } catch (\Throwable $e) {
            Schema::table('players', function (Blueprint $table) {
                $table->string('position', 50)->default('Flank')->change();
            });
        }

        try {
            DB::statement("ALTER TABLE `registrants` MODIFY COLUMN `position` VARCHAR(50) NOT NULL DEFAULT 'MID'");
        } catch (\Throwable $e) {
            Schema::table('registrants', function (Blueprint $table) {
                $table->string('position', 50)->default('MID')->change();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No down needed as VARCHAR(50) is safe and backward compatible
    }
};

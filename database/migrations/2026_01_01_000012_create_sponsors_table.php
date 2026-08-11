<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sponsors', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('logo_url')->nullable();
            $table->enum('tier', ['main', 'gold', 'silver', 'partner', 'media'])->default('gold');
            $table->string('website_url')->nullable();
            $table->integer('order')->default(0);
            $table->timestamps();
        });

        Schema::table('competitions', function (Blueprint $table) {
            $table->text('about_description')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sponsors');
        Schema::table('competitions', function (Blueprint $table) {
            $table->dropColumn('about_description');
        });
    }
};

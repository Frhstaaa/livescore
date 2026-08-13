<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('matches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('competition_id')->constrained('competitions')->onDelete('cascade');
            $table->foreignId('home_team_id')->constrained('teams')->onDelete('cascade');
            $table->foreignId('away_team_id')->constrained('teams')->onDelete('cascade');
            $table->dateTime('match_date');
            $table->string('venue', 150)->default('Rama Futsall Kadipaten');
            $table->enum('status', ['scheduled', 'live', 'half_time', 'full_time', 'postponed', 'cancelled'])->default('scheduled');
            $table->integer('current_minute')->default(0);
            $table->integer('home_score')->default(0);
            $table->integer('away_score')->default(0);
            $table->string('round', 50)->default('Babak Penyisihan');
            $table->foreignId('best_player_id')->nullable()->constrained('players')->onDelete('set null');
            $table->decimal('best_player_rating', 3, 1)->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('matches');
    }
};

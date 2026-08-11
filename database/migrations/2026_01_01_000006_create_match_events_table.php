<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('match_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('match_id')->constrained('matches')->onDelete('cascade');
            $table->foreignId('team_id')->constrained('teams')->onDelete('cascade');
            $table->foreignId('player_id')->nullable()->constrained('players')->onDelete('set null');
            $table->foreignId('related_player_id')->nullable()->constrained('players')->onDelete('set null');
            $table->enum('event_type', ['goal', 'yellow_card', 'red_card', 'substitution_in', 'substitution_out', 'timeout', 'own_goal']);
            $table->integer('minute');
            $table->text('extra_info')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('match_events');
    }
};

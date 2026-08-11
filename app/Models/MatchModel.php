<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MatchModel extends Model
{
    use HasFactory;

    protected $table = 'matches';

    protected $fillable = [
        'competition_id',
        'home_team_id',
        'away_team_id',
        'match_date',
        'venue',
        'status',
        'started_at',
        'paused_seconds',
        'current_minute',
        'home_score',
        'away_score',
        'round',
        'best_player_id',
        'best_player_rating',
        'created_by',
    ];

    protected $casts = [
        'match_date' => 'datetime',
        'started_at' => 'datetime',
        'paused_seconds' => 'integer',
        'home_score' => 'integer',
        'away_score' => 'integer',
        'current_minute' => 'integer',
        'best_player_rating' => 'float',
    ];

    protected $appends = ['elapsed_seconds'];

    public function getElapsedSecondsAttribute(): int
    {
        if ($this->status === 'live' && $this->started_at) {
            $diff = now()->diffInSeconds($this->started_at);
            return (int) $this->paused_seconds + $diff;
        }
        return (int) $this->paused_seconds ?: (($this->current_minute ?? 0) * 60);
    }

    public function competition()
    {
        return $this->belongsTo(Competition::class, 'competition_id');
    }

    public function homeTeam()
    {
        return $this->belongsTo(Team::class, 'home_team_id');
    }

    public function awayTeam()
    {
        return $this->belongsTo(Team::class, 'away_team_id');
    }

    public function bestPlayer()
    {
        return $this->belongsTo(Player::class, 'best_player_id');
    }

    public function events()
    {
        return $this->hasMany(MatchEvent::class, 'match_id')->orderBy('minute', 'desc')->orderBy('created_at', 'desc');
    }

    public function statistics()
    {
        return $this->hasMany(MatchStatistic::class, 'match_id');
    }

    public function lineups()
    {
        return $this->hasMany(MatchLineup::class, 'match_id');
    }
}

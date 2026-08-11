<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MatchEvent extends Model
{
    use HasFactory;

    protected $fillable = [
        'match_id',
        'team_id',
        'player_id',
        'related_player_id',
        'event_type',
        'minute',
        'extra_info',
        'created_by',
    ];

    public function match()
    {
        return $this->belongsTo(MatchModel::class, 'match_id');
    }

    public function team()
    {
        return $this->belongsTo(Team::class, 'team_id');
    }

    public function player()
    {
        return $this->belongsTo(Player::class, 'player_id');
    }

    public function relatedPlayer()
    {
        return $this->belongsTo(Player::class, 'related_player_id');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PlayerSeasonStat extends Model
{
    use HasFactory;

    protected $fillable = [
        'player_id',
        'competition_id',
        'goals',
        'assists',
        'yellow_cards',
        'red_cards',
        'matches_played',
        'man_of_the_match_count',
    ];

    public function player()
    {
        return $this->belongsTo(Player::class, 'player_id');
    }

    public function competition()
    {
        return $this->belongsTo(Competition::class, 'competition_id');
    }
}

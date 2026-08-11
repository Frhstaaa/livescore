<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Standing extends Model
{
    use HasFactory;

    protected $fillable = [
        'competition_id',
        'team_id',
        'played',
        'win',
        'draw',
        'lose',
        'goals_for',
        'goals_against',
        'goal_difference',
        'points',
        'rank',
    ];

    public function competition()
    {
        return $this->belongsTo(Competition::class, 'competition_id');
    }

    public function team()
    {
        return $this->belongsTo(Team::class, 'team_id');
    }
}

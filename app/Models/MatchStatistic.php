<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MatchStatistic extends Model
{
    use HasFactory;

    protected $fillable = [
        'match_id',
        'team_id',
        'possession_percent',
        'shots_total',
        'shots_on_target',
        'fouls',
        'corners',
        'yellow_cards',
        'red_cards',
    ];

    protected $casts = [
        'possession_percent' => 'float',
    ];

    public function match()
    {
        return $this->belongsTo(MatchModel::class, 'match_id');
    }

    public function team()
    {
        return $this->belongsTo(Team::class, 'team_id');
    }
}

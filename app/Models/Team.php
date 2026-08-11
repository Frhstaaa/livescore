<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Team extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'short_name',
        'logo_url',
        'coach_name',
        'founded_year',
    ];

    public function players()
    {
        return $this->hasMany(Player::class, 'team_id');
    }

    public function homeMatches()
    {
        return $this->hasMany(MatchModel::class, 'home_team_id');
    }

    public function awayMatches()
    {
        return $this->hasMany(MatchModel::class, 'away_team_id');
    }

    public function standings()
    {
        return $this->hasMany(Standing::class, 'team_id');
    }
}

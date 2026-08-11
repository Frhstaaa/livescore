<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Player extends Model
{
    use HasFactory;

    protected $fillable = [
        'team_id',
        'name',
        'photo_url',
        'jersey_number',
        'position',
        'date_of_birth',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'date_of_birth' => 'date',
    ];

    public function team()
    {
        return $this->belongsTo(Team::class, 'team_id');
    }

    public function seasonStats()
    {
        return $this->hasMany(PlayerSeasonStat::class, 'player_id');
    }
}

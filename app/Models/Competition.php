<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Competition extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'season',
        'type',
        'match_duration_minutes',
        'half_duration_minutes',
        'points_win',
        'points_draw',
        'points_loss',
        'start_date',
        'end_date',
        'is_active',
        'about_description',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'start_date' => 'date',
        'end_date' => 'date',
        'match_duration_minutes' => 'integer',
        'half_duration_minutes' => 'integer',
        'points_win' => 'integer',
        'points_draw' => 'integer',
        'points_loss' => 'integer',
    ];

    public function matches()
    {
        return $this->hasMany(MatchModel::class, 'competition_id');
    }

    public function standings()
    {
        return $this->hasMany(Standing::class, 'competition_id');
    }
}

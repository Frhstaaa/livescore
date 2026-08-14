<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Registrant extends Model
{
    protected $fillable = [
        'competition_id',
        'name',
        'phone',
        'position',
        'status',
    ];

    public function competition()
    {
        return $this->belongsTo(Competition::class);
    }
}

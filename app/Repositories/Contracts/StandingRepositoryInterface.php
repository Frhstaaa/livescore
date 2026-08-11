<?php

namespace App\Repositories\Contracts;

use Illuminate\Database\Eloquent\Collection;

interface StandingRepositoryInterface
{
    public function getStandingsByCompetition(int $competitionId): Collection;
    public function recalculateStandings(int $competitionId): void;
}

<?php

namespace App\Services;

use App\Repositories\Contracts\StandingRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class StandingService
{
    public function __construct(
        protected StandingRepositoryInterface $standingRepo
    ) {}

    public function getStandings(int $competitionId): Collection
    {
        return $this->standingRepo->getStandingsByCompetition($competitionId);
    }
}

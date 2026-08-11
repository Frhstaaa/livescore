<?php

namespace App\Repositories\Contracts;

use Illuminate\Support\Collection;

interface LeaderboardRepositoryInterface
{
    public function getTopScorers(int $competitionId, int $limit = 20): Collection;
    public function getTopAssists(int $competitionId, int $limit = 20): Collection;
    public function getTopCards(int $competitionId, int $limit = 20): Collection;
    public function updatePlayerStats(int $playerId, int $competitionId): void;
}

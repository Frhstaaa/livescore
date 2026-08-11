<?php

namespace App\Repositories\Contracts;

use App\Models\MatchModel;
use Illuminate\Database\Eloquent\Collection;

interface MatchRepositoryInterface
{
    public function getMatchesByDate(?string $date, ?int $competitionId = null): Collection;
    public function getMatchWithDetails(int $id): ?MatchModel;
    public function getLiveMatches(): Collection;
    public function updateMatchStatus(int $id, string $status, ?int $minute = null): MatchModel;
    public function updateMatchScore(int $id, int $homeScore, int $awayScore): MatchModel;
    public function getHeadToHead(int $teamAId, int $teamBId): Collection;
}

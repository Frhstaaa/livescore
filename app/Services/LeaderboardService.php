<?php

namespace App\Services;

use App\Repositories\Contracts\LeaderboardRepositoryInterface;

class LeaderboardService
{
    public function __construct(
        protected LeaderboardRepositoryInterface $leaderboardRepo
    ) {}

    public function getLeaderboards(int $competitionId): array
    {
        return [
            'topScorers' => $this->leaderboardRepo->getTopScorers($competitionId),
            'topAssists' => $this->leaderboardRepo->getTopAssists($competitionId),
            'topCards' => $this->leaderboardRepo->getTopCards($competitionId),
        ];
    }
}

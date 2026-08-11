<?php

namespace App\Services;

use App\Repositories\Contracts\MatchRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class MatchService
{
    public function __construct(
        protected MatchRepositoryInterface $matchRepo
    ) {}

    public function getLivescoreData(?string $date, ?int $competitionId = null): array
    {
        $matches = $this->matchRepo->getMatchesByDate($date, $competitionId);

        return [
            'matches' => $matches,
            'selectedDate' => $date ?? now()->toDateString(),
        ];
    }

    public function getMatchDetails(int $id): array
    {
        $match = $this->matchRepo->getMatchWithDetails($id);

        if (!$match) {
            return [];
        }

        $h2h = $this->matchRepo->getHeadToHead($match->home_team_id, $match->away_team_id);

        return [
            'match' => $match,
            'h2h' => $h2h,
        ];
    }
}

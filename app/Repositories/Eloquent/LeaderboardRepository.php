<?php

namespace App\Repositories\Eloquent;

use App\Models\MatchEvent;
use App\Models\MatchModel;
use App\Models\PlayerSeasonStat;
use App\Repositories\Contracts\LeaderboardRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class LeaderboardRepository implements LeaderboardRepositoryInterface
{
    public function getTopScorers(int $competitionId, int $limit = 20): Collection
    {
        return PlayerSeasonStat::with(['player.team'])
            ->where('competition_id', $competitionId)
            ->where('goals', '>', 0)
            ->orderBy('goals', 'desc')
            ->orderBy('assists', 'desc')
            ->limit($limit)
            ->get();
    }

    public function getTopAssists(int $competitionId, int $limit = 20): Collection
    {
        return PlayerSeasonStat::with(['player.team'])
            ->where('competition_id', $competitionId)
            ->where('assists', '>', 0)
            ->orderBy('assists', 'desc')
            ->orderBy('goals', 'desc')
            ->limit($limit)
            ->get();
    }

    public function getTopCards(int $competitionId, int $limit = 20): Collection
    {
        return PlayerSeasonStat::with(['player.team'])
            ->where('competition_id', $competitionId)
            ->where(function ($q) {
                $q->where('yellow_cards', '>', 0)->orWhere('red_cards', '>', 0);
            })
            ->orderBy('red_cards', 'desc')
            ->orderBy('yellow_cards', 'desc')
            ->limit($limit)
            ->get();
    }

    public function updatePlayerStats(int $playerId, int $competitionId): void
    {
        $matchIds = MatchModel::where('competition_id', $competitionId)
            ->where('status', 'full_time')
            ->pluck('id');

        $goals = MatchEvent::whereIn('match_id', $matchIds)
            ->where('player_id', $playerId)
            ->where('event_type', 'goal')
            ->count();

        $assists = MatchEvent::whereIn('match_id', $matchIds)
            ->where('related_player_id', $playerId)
            ->where('event_type', 'goal')
            ->count();

        $yellowCards = MatchEvent::whereIn('match_id', $matchIds)
            ->where('player_id', $playerId)
            ->where('event_type', 'yellow_card')
            ->count();

        $redCards = MatchEvent::whereIn('match_id', $matchIds)
            ->where('player_id', $playerId)
            ->where('event_type', 'red_card')
            ->count();

        $motm = MatchModel::whereIn('id', $matchIds)
            ->where('best_player_id', $playerId)
            ->count();

        PlayerSeasonStat::updateOrCreate(
            [
                'player_id' => $playerId,
                'competition_id' => $competitionId,
            ],
            [
                'goals' => $goals,
                'assists' => $assists,
                'yellow_cards' => $yellowCards,
                'red_cards' => $redCards,
                'man_of_the_match_count' => $motm,
            ]
        );
    }
}

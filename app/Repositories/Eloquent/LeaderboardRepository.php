<?php

namespace App\Repositories\Eloquent;

use App\Models\MatchEvent;
use App\Models\MatchModel;
use App\Models\Player;
use App\Models\PlayerSeasonStat;
use App\Repositories\Contracts\LeaderboardRepositoryInterface;
use Illuminate\Support\Collection;

class LeaderboardRepository implements LeaderboardRepositoryInterface
{
    public function getTopScorers(int $competitionId, int $limit = 20): Collection
    {
        // 1. Check recalculate PlayerSeasonStat
        $stats = PlayerSeasonStat::with(['player.team'])
            ->where('competition_id', $competitionId)
            ->where('goals', '>', 0)
            ->orderBy('goals', 'desc')
            ->orderBy('assists', 'desc')
            ->limit($limit)
            ->get();

        if ($stats->count() > 0) {
            return $stats->map(function ($s) {
                return [
                    'id' => $s->player_id,
                    'name' => $s->player?->name ?? 'Pemain',
                    'jersey_number' => $s->player?->jersey_number ?? 0,
                    'position' => $s->player?->position ?? 'FP',
                    'team' => $s->player?->team,
                    'goals' => $s->goals,
                    'total_goals' => $s->goals,
                ];
            });
        }

        // 2. Realtime MatchEvent fallback calculation
        $liveScorers = MatchEvent::whereHas('match', function ($q) use ($competitionId) {
                $q->where('competition_id', $competitionId);
            })
            ->where('event_type', 'goal')
            ->whereNotNull('player_id')
            ->selectRaw('player_id, COUNT(*) as goals')
            ->groupBy('player_id')
            ->orderBy('goals', 'desc')
            ->limit($limit)
            ->get();

        if ($liveScorers->count() > 0) {
            return $liveScorers->map(function ($item) {
                $p = Player::with('team')->find($item->player_id);
                return [
                    'id' => $p?->id,
                    'name' => $p?->name ?? 'Pemain',
                    'jersey_number' => $p?->jersey_number ?? 0,
                    'position' => $p?->position ?? 'FP',
                    'team' => $p?->team,
                    'goals' => $item->goals,
                    'total_goals' => $item->goals,
                ];
            });
        }

        // 3. Default fallback: list all active players with 0 goals
        return Player::with('team')
            ->orderBy('name', 'asc')
            ->limit($limit)
            ->get()
            ->map(function ($p) {
                return [
                    'id' => $p->id,
                    'name' => $p->name,
                    'jersey_number' => $p->jersey_number,
                    'position' => $p->position,
                    'team' => $p->team,
                    'goals' => 0,
                    'total_goals' => 0,
                ];
            });
    }

    public function getTopAssists(int $competitionId, int $limit = 20): Collection
    {
        $stats = PlayerSeasonStat::with(['player.team'])
            ->where('competition_id', $competitionId)
            ->where('assists', '>', 0)
            ->orderBy('assists', 'desc')
            ->orderBy('goals', 'desc')
            ->limit($limit)
            ->get();

        if ($stats->count() > 0) {
            return $stats->map(function ($s) {
                return [
                    'id' => $s->player_id,
                    'name' => $s->player?->name ?? 'Pemain',
                    'jersey_number' => $s->player?->jersey_number ?? 0,
                    'position' => $s->player?->position ?? 'FP',
                    'team' => $s->player?->team,
                    'assists' => $s->assists,
                    'total_assists' => $s->assists,
                ];
            });
        }

        // Realtime MatchEvent fallback calculation for assists
        $liveAssists = MatchEvent::whereHas('match', function ($q) use ($competitionId) {
                $q->where('competition_id', $competitionId);
            })
            ->where('event_type', 'goal')
            ->whereNotNull('related_player_id')
            ->selectRaw('related_player_id as player_id, COUNT(*) as assists')
            ->groupBy('related_player_id')
            ->orderBy('assists', 'desc')
            ->limit($limit)
            ->get();

        if ($liveAssists->count() > 0) {
            return $liveAssists->map(function ($item) {
                $p = Player::with('team')->find($item->player_id);
                return [
                    'id' => $p?->id,
                    'name' => $p?->name ?? 'Pemain',
                    'jersey_number' => $p?->jersey_number ?? 0,
                    'position' => $p?->position ?? 'FP',
                    'team' => $p?->team,
                    'assists' => $item->assists,
                    'total_assists' => $item->assists,
                ];
            });
        }

        return Player::with('team')
            ->orderBy('name', 'asc')
            ->limit($limit)
            ->get()
            ->map(function ($p) {
                return [
                    'id' => $p->id,
                    'name' => $p->name,
                    'jersey_number' => $p->jersey_number,
                    'position' => $p->position,
                    'team' => $p->team,
                    'assists' => 0,
                    'total_assists' => 0,
                ];
            });
    }

    public function getTopCards(int $competitionId, int $limit = 20): Collection
    {
        $stats = PlayerSeasonStat::with(['player.team'])
            ->where('competition_id', $competitionId)
            ->where(function ($q) {
                $q->where('yellow_cards', '>', 0)->orWhere('red_cards', '>', 0);
            })
            ->orderBy('red_cards', 'desc')
            ->orderBy('yellow_cards', 'desc')
            ->limit($limit)
            ->get();

        if ($stats->count() > 0) {
            return $stats->map(function ($s) {
                return [
                    'id' => $s->player_id,
                    'name' => $s->player?->name ?? 'Pemain',
                    'jersey_number' => $s->player?->jersey_number ?? 0,
                    'team' => $s->player?->team,
                    'yellow_cards' => $s->yellow_cards,
                    'red_cards' => $s->red_cards,
                ];
            });
        }

        return Player::with('team')
            ->orderBy('name', 'asc')
            ->limit($limit)
            ->get()
            ->map(function ($p) {
                return [
                    'id' => $p->id,
                    'name' => $p->name,
                    'jersey_number' => $p->jersey_number,
                    'position' => $p->position,
                    'team' => $p->team,
                    'yellow_cards' => 0,
                    'red_cards' => 0,
                ];
            });
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

<?php

namespace App\Services;

use App\Models\MatchEvent;
use App\Models\MatchModel;
use App\Models\Player;
use App\Repositories\Contracts\MatchRepositoryInterface;
use App\Repositories\Contracts\StandingRepositoryInterface;
use App\Repositories\Contracts\LeaderboardRepositoryInterface;
use Illuminate\Support\Facades\DB;

class LiveControlService
{
    public function __construct(
        protected MatchRepositoryInterface $matchRepo,
        protected StandingRepositoryInterface $standingRepo,
        protected LeaderboardRepositoryInterface $leaderboardRepo
    ) {}

    public function updateStatus(int $matchId, string $status, ?int $minute = null): MatchModel
    {
        return DB::transaction(function () use ($matchId, $status, $minute) {
            $match = $this->matchRepo->updateMatchStatus($matchId, $status, $minute);

            if ($status === 'full_time') {
                // Trigger auto calculation for standings & player stats
                $this->standingRepo->recalculateStandings($match->competition_id);

                // Update leaderboard for players in match
                $playerIds = MatchEvent::where('match_id', $matchId)->pluck('player_id')->filter()->unique();
                foreach ($playerIds as $pid) {
                    $this->leaderboardRepo->updatePlayerStats($pid, $match->competition_id);
                }
            }

            return $match;
        });
    }

    public function recordEvent(int $matchId, array $data): MatchEvent
    {
        return DB::transaction(function () use ($matchId, $data) {
            $event = MatchEvent::create([
                'match_id' => $matchId,
                'team_id' => $data['team_id'],
                'player_id' => $data['player_id'] ?? null,
                'related_player_id' => $data['related_player_id'] ?? null,
                'event_type' => $data['event_type'],
                'minute' => $data['minute'] ?? 0,
                'extra_info' => $data['extra_info'] ?? null,
                'created_by' => auth()->id() ?? null,
            ]);

            $match = MatchModel::findOrFail($matchId);

            if ($data['event_type'] === 'goal') {
                if ($data['team_id'] == $match->home_team_id) {
                    $match->home_score += 1;
                } else {
                    $match->away_score += 1;
                }
                $match->save();
            } elseif ($data['event_type'] === 'own_goal') {
                // Own goal scores for opponent
                if ($data['team_id'] == $match->home_team_id) {
                    $match->away_score += 1;
                } else {
                    $match->home_score += 1;
                }
                $match->save();
            }

            return $event;
        });
    }

    public function deleteEvent(int $eventId): MatchModel
    {
        return DB::transaction(function () use ($eventId) {
            $event = MatchEvent::findOrFail($eventId);
            $matchId = $event->match_id;
            $playerId = $event->player_id;

            // Delete the event record
            $event->delete();

            $match = MatchModel::findOrFail($matchId);

            // Automatically recalculate scores based on remaining events
            $homeGoals = MatchEvent::where('match_id', $matchId)
                ->where(function ($q) use ($match) {
                    $q->where(function ($sub) use ($match) {
                        $sub->where('event_type', 'goal')->where('team_id', $match->home_team_id);
                    })->orWhere(function ($sub) use ($match) {
                        $sub->where('event_type', 'own_goal')->where('team_id', $match->away_team_id);
                    });
                })->count();

            $awayGoals = MatchEvent::where('match_id', $matchId)
                ->where(function ($q) use ($match) {
                    $q->where(function ($sub) use ($match) {
                        $sub->where('event_type', 'goal')->where('team_id', $match->away_team_id);
                    })->orWhere(function ($sub) use ($match) {
                        $sub->where('event_type', 'own_goal')->where('team_id', $match->home_team_id);
                    });
                })->count();

            $match->home_score = $homeGoals;
            $match->away_score = $awayGoals;
            $match->save();

            // If match is finished, update standings & leaderboard
            if ($match->status === 'full_time') {
                $this->standingRepo->recalculateStandings($match->competition_id);
                if ($playerId) {
                    $this->leaderboardRepo->updatePlayerStats($playerId, $match->competition_id);
                }
            }

            return $match;
        });
    }

    public function setManOfTheMatch(int $matchId, int $playerId, float $rating): MatchModel
    {
        $match = MatchModel::findOrFail($matchId);
        $match->best_player_id = $playerId;
        $match->best_player_rating = $rating;
        $match->save();

        if ($match->status === 'full_time') {
            $this->leaderboardRepo->updatePlayerStats($playerId, $match->competition_id);
        }

        return $match;
    }
}

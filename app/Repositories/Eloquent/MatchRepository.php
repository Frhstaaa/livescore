<?php

namespace App\Repositories\Eloquent;

use App\Models\MatchModel;
use App\Repositories\Contracts\MatchRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class MatchRepository implements MatchRepositoryInterface
{
    public function getAllMatches(): Collection
    {
        return MatchModel::with(['competition', 'homeTeam', 'awayTeam'])
            ->orderBy('match_date', 'desc')
            ->get();
    }

    public function getMatchesByDate(?string $date = null, ?int $competitionId = null): Collection
    {
        $query = MatchModel::with(['competition', 'homeTeam', 'awayTeam', 'bestPlayer'])
            ->orderBy('match_date', 'asc');

        if ($date) {
            $query->whereDate('match_date', $date);
        }

        if ($competitionId) {
            $query->where('competition_id', $competitionId);
        }

        return $query->get();
    }

    public function getMatchWithDetails(int $id): ?MatchModel
    {
        return MatchModel::with([
            'competition',
            'homeTeam',
            'awayTeam',
            'bestPlayer',
            'events.player',
            'events.relatedPlayer',
            'events.team',
            'statistics.team',
            'lineups.player',
            'lineups.team'
        ])->find($id);
    }

    public function getLiveMatches(): Collection
    {
        return MatchModel::with(['competition', 'homeTeam', 'awayTeam'])
            ->whereIn('status', ['live', 'half_time'])
            ->orderBy('match_date', 'asc')
            ->get();
    }

    public function updateMatchStatus(int $id, string $status, ?int $minute = null): MatchModel
    {
        $match = MatchModel::findOrFail($id);
        $oldStatus = $match->status;
        $match->status = $status;

        if ($status === 'live') {
            if ($oldStatus !== 'live' || !$match->started_at) {
                $match->started_at = now();
                if ($minute !== null) {
                    $match->paused_seconds = $minute * 60;
                    $match->current_minute = $minute;
                }
            } elseif ($minute !== null && $minute !== $match->current_minute) {
                $match->paused_seconds = $minute * 60;
                $match->started_at = now();
                $match->current_minute = $minute;
            }
        } else {
            // Paused or Finished or Scheduled
            if ($oldStatus === 'live' && $match->started_at) {
                $match->paused_seconds = $match->elapsed_seconds;
                $match->started_at = null;
                $match->current_minute = (int) floor($match->paused_seconds / 60);
            }
            if ($minute !== null) {
                $match->current_minute = $minute;
                $match->paused_seconds = $minute * 60;
            }
            if ($status === 'scheduled') {
                $match->started_at = null;
                $match->paused_seconds = 0;
                $match->current_minute = 0;
                $match->home_score = 0;
                $match->away_score = 0;
            }
        }

        $match->save();
        return $match;
    }

    public function updateMatchScore(int $id, int $homeScore, int $awayScore): MatchModel
    {
        $match = MatchModel::findOrFail($id);
        $match->home_score = $homeScore;
        $match->away_score = $awayScore;
        $match->save();
        return $match;
    }

    public function getHeadToHead(int $teamAId, int $teamBId): Collection
    {
        return MatchModel::with(['homeTeam', 'awayTeam'])
            ->where(function ($q) use ($teamAId, $teamBId) {
                $q->where('home_team_id', $teamAId)->where('away_team_id', $teamBId);
            })
            ->orWhere(function ($q) use ($teamAId, $teamBId) {
                $q->where('home_team_id', $teamBId)->where('away_team_id', $teamAId);
            })
            ->where('status', 'full_time')
            ->get();
    }
}

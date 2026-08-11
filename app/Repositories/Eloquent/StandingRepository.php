<?php

namespace App\Repositories\Eloquent;

use App\Models\MatchModel;
use App\Models\Standing;
use App\Models\Team;
use App\Repositories\Contracts\StandingRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class StandingRepository implements StandingRepositoryInterface
{
    public function getStandingsByCompetition(int $competitionId): Collection
    {
        return Standing::with('team')
            ->where('competition_id', $competitionId)
            ->orderBy('points', 'desc')
            ->orderBy('goal_difference', 'desc')
            ->orderBy('goals_for', 'desc')
            ->get();
    }

    public function recalculateStandings(int $competitionId): void
    {
        $teams = Team::all();

        foreach ($teams as $team) {
            $homeMatches = MatchModel::where('competition_id', $competitionId)
                ->where('home_team_id', $team->id)
                ->where('status', 'full_time')
                ->get();

            $awayMatches = MatchModel::where('competition_id', $competitionId)
                ->where('away_team_id', $team->id)
                ->where('status', 'full_time')
                ->get();

            $played = 0;
            $win = 0;
            $draw = 0;
            $lose = 0;
            $goalsFor = 0;
            $goalsAgainst = 0;

            foreach ($homeMatches as $m) {
                $played++;
                $goalsFor += $m->home_score;
                $goalsAgainst += $m->away_score;
                if ($m->home_score > $m->away_score) $win++;
                elseif ($m->home_score == $m->away_score) $draw++;
                else $lose++;
            }

            foreach ($awayMatches as $m) {
                $played++;
                $goalsFor += $m->away_score;
                $goalsAgainst += $m->home_score;
                if ($m->away_score > $m->home_score) $win++;
                elseif ($m->away_score == $m->home_score) $draw++;
                else $lose++;
            }

            $points = ($win * 3) + ($draw * 1);
            $goalDifference = $goalsFor - $goalsAgainst;

            Standing::updateOrCreate(
                [
                    'competition_id' => $competitionId,
                    'team_id' => $team->id,
                ],
                [
                    'played' => $played,
                    'win' => $win,
                    'draw' => $draw,
                    'lose' => $lose,
                    'goals_for' => $goalsFor,
                    'goals_against' => $goalsAgainst,
                    'goal_difference' => $goalDifference,
                    'points' => $points,
                ]
            );
        }

        // Rank updates
        $standings = Standing::where('competition_id', $competitionId)
            ->orderBy('points', 'desc')
            ->orderBy('goal_difference', 'desc')
            ->orderBy('goals_for', 'desc')
            ->get();

        $rank = 1;
        foreach ($standings as $st) {
            $st->rank = $rank++;
            $st->save();
        }
    }
}

<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Competition;
use App\Models\MatchEvent;
use App\Models\MatchModel;
use App\Models\Standing;
use App\Models\Team;
use App\Services\LeaderboardService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PlayerController extends Controller
{
    public function __construct(
        protected LeaderboardService $leaderboardService
    ) {}

    public function index(Request $request): Response
    {
        $activeComp = Competition::where('is_active', true)->first();
        $compId = (int) $request->query('competition_id', $activeComp ? $activeComp->id : 1);
        $teamId = $request->query('team_id');
        $initialTab = $request->query('tab', 'scorers');

        $leaderboards = $this->leaderboardService->getLeaderboards($compId);
        $competitions = Competition::orderBy('is_active', 'desc')->get();

        // Get all teams with tournament summary stats for the squad list overview
        $teams = Team::withCount('players')->orderBy('name', 'asc')->get()->map(function ($t) use ($compId) {
            $matchIds = MatchModel::where('competition_id', $compId)
                ->where(function($q) use ($t) {
                    $q->where('home_team_id', $t->id)->orWhere('away_team_id', $t->id);
                })
                ->pluck('id');

            $goals = MatchEvent::whereIn('match_id', $matchIds)
                ->where('team_id', $t->id)
                ->where('event_type', 'goal')
                ->count();

            $standing = Standing::where('competition_id', $compId)
                ->where('team_id', $t->id)
                ->first();

            return [
                'id' => $t->id,
                'name' => $t->name,
                'short_name' => $t->short_name,
                'logo_url' => $t->logo_url,
                'coach_name' => $t->coach_name,
                'players_count' => $t->players_count,
                'total_goals' => $goals,
                'position' => $standing?->position ?? null,
                'points' => $standing?->points ?? 0,
                'played' => $standing?->played ?? 0,
            ];
        });

        // Selected Team detail with players & their detailed tournament stats (if a team is selected)
        $selectedTeam = null;

        if ($teamId) {
            $team = Team::with(['players' => function($q) {
                $q->orderBy('jersey_number', 'asc')->orderBy('name', 'asc');
            }])->find($teamId);

            if ($team) {
                // Match IDs for this team in this competition
                $teamMatches = MatchModel::where('competition_id', $compId)
                    ->where(function($q) use ($team) {
                        $q->where('home_team_id', $team->id)
                          ->orWhere('away_team_id', $team->id);
                    })
                    ->with(['homeTeam', 'awayTeam'])
                    ->orderBy('match_date', 'desc')
                    ->get();

                $completedMatches = $teamMatches->where('status', 'full_time');
                $matchIds = $teamMatches->pluck('id');

                // Standing for this team in this competition
                $standing = Standing::where('competition_id', $compId)
                    ->where('team_id', $team->id)
                    ->first();

                // Compute player-level stats for every player in the squad
                $playerStats = $team->players->map(function ($player) use ($matchIds) {
                    $goals = MatchEvent::whereIn('match_id', $matchIds)
                        ->where('player_id', $player->id)
                        ->where('event_type', 'goal')
                        ->count();

                    $assists = MatchEvent::whereIn('match_id', $matchIds)
                        ->where('related_player_id', $player->id)
                        ->where('event_type', 'goal')
                        ->count();

                    $yellowCards = MatchEvent::whereIn('match_id', $matchIds)
                        ->where('player_id', $player->id)
                        ->where('event_type', 'yellow_card')
                        ->count();

                    $redCards = MatchEvent::whereIn('match_id', $matchIds)
                        ->where('player_id', $player->id)
                        ->where('event_type', 'red_card')
                        ->count();

                    $motm = MatchModel::whereIn('id', $matchIds)
                        ->where('best_player_id', $player->id)
                        ->count();

                    // Recent goal events detail (minute and match)
                    $goalEvents = MatchEvent::whereIn('match_id', $matchIds)
                        ->where('player_id', $player->id)
                        ->where('event_type', 'goal')
                        ->with(['match.homeTeam', 'match.awayTeam'])
                        ->get()
                        ->map(function($ev) use ($player) {
                            $m = $ev->match;
                            $opp = $m ? ($m->home_team_id === $player->team_id ? $m->awayTeam?->short_name : $m->homeTeam?->short_name) : '-';
                            return [
                                'minute' => $ev->minute,
                                'opponent' => $opp,
                                'round' => $m?->round,
                            ];
                        });

                    return [
                        'id' => $player->id,
                        'name' => $player->name,
                        'jersey_number' => $player->jersey_number,
                        'position' => $player->position,
                        'photo_url' => $player->photo_url,
                        'goals' => $goals,
                        'assists' => $assists,
                        'yellow_cards' => $yellowCards,
                        'red_cards' => $redCards,
                        'motm_count' => $motm,
                        'goal_events' => $goalEvents,
                    ];
                });

                // Team summary metrics
                $totalTeamGoals = $playerStats->sum('goals');
                $totalAssists = $playerStats->sum('assists');
                $totalYellowCards = $playerStats->sum('yellow_cards');
                $totalRedCards = $playerStats->sum('red_cards');
                $topScorerPlayer = $playerStats->where('goals', '>', 0)->sortByDesc('goals')->first();

                // Recent match form (W, D, L)
                $recentForm = $completedMatches->take(5)->map(function($m) use ($team) {
                    $isHome = $m->home_team_id === $team->id;
                    $teamScore = $isHome ? $m->home_score : $m->away_score;
                    $oppScore = $isHome ? $m->away_score : $m->home_score;
                    $oppName = $isHome ? ($m->awayTeam?->short_name ?: $m->awayTeam?->name) : ($m->homeTeam?->short_name ?: $m->homeTeam?->name);

                    $res = 'D';
                    if ($teamScore > $oppScore) $res = 'W';
                    elseif ($teamScore < $oppScore) $res = 'L';

                    return [
                        'result' => $res,
                        'score' => "{$teamScore}-{$oppScore}",
                        'opponent' => $oppName,
                        'round' => $m->round,
                    ];
                })->values();

                $selectedTeam = [
                    'id' => $team->id,
                    'name' => $team->name,
                    'short_name' => $team->short_name,
                    'logo_url' => $team->logo_url,
                    'coach_name' => $team->coach_name,
                    'founded_year' => $team->founded_year,
                    'players' => $playerStats,
                    'summary' => [
                        'total_players' => $playerStats->count(),
                        'total_goals' => $totalTeamGoals,
                        'total_assists' => $totalAssists,
                        'yellow_cards' => $totalYellowCards,
                        'red_cards' => $totalRedCards,
                        'top_scorer' => $topScorerPlayer,
                    ],
                    'standing' => $standing ? [
                        'position' => $standing->position,
                        'played' => $standing->played,
                        'won' => $standing->won,
                        'drawn' => $standing->drawn,
                        'lost' => $standing->lost,
                        'goals_for' => $standing->goals_for,
                        'goals_against' => $standing->goals_against,
                        'goal_difference' => $standing->goal_difference,
                        'points' => $standing->points,
                    ] : null,
                    'recent_form' => $recentForm,
                ];
            }
        }

        return Inertia::render('Players/Index', [
            'topScorers' => $leaderboards['topScorers'],
            'topAssists' => $leaderboards['topAssists'],
            'topCards' => $leaderboards['topCards'],
            'competitions' => $competitions,
            'teams' => $teams,
            'selectedCompetitionId' => $compId,
            'selectedTeam' => $selectedTeam,
            'initialTab' => $initialTab,
        ]);
    }
}

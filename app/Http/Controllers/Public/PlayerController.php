<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Competition;
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
        $compId = $request->query('competition_id', $activeComp ? $activeComp->id : 1);
        $teamId = $request->query('team_id');

        $leaderboards = $this->leaderboardService->getLeaderboards($compId);
        $competitions = Competition::orderBy('is_active', 'desc')->get();
        $teams = Team::orderBy('name', 'asc')->get();

        // Selected Team detail with players & their season stats
        $selectedTeam = null;
        if ($teamId) {
            $selectedTeam = Team::with(['players.seasonStats' => function($q) use ($compId) {
                $q->where('competition_id', $compId);
            }])->find($teamId);
        } else if ($teams->count() > 0) {
            $selectedTeam = Team::with(['players.seasonStats' => function($q) use ($compId) {
                $q->where('competition_id', $compId);
            }])->find($teams->first()->id);
        }

        return Inertia::render('Players/Index', [
            'topScorers' => $leaderboards['topScorers'],
            'topAssists' => $leaderboards['topAssists'],
            'topCards' => $leaderboards['topCards'],
            'competitions' => $competitions,
            'teams' => $teams,
            'selectedCompetitionId' => (int) $compId,
            'selectedTeam' => $selectedTeam,
        ]);
    }
}

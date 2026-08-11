<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MatchModel;
use App\Models\Player;
use App\Models\Team;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $totalTeams = Team::count();
        $totalPlayers = Player::count();
        $liveMatches = MatchModel::whereIn('status', ['live', 'half_time'])->count();
        $upcomingMatches = MatchModel::where('status', 'scheduled')->count();

        $recentMatches = MatchModel::with(['homeTeam', 'awayTeam', 'competition'])
            ->orderBy('match_date', 'desc')
            ->take(5)
            ->get();

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'totalTeams' => $totalTeams,
                'totalPlayers' => $totalPlayers,
                'liveMatches' => $liveMatches,
                'upcomingMatches' => $upcomingMatches,
            ],
            'recentMatches' => $recentMatches,
        ]);
    }
}

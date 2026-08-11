<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Competition;
use App\Models\Team;
use Inertia\Inertia;
use Inertia\Response;

class FavoriteController extends Controller
{
    public function index(): Response
    {
        $teams = Team::with(['players', 'standings'])->get();
        $competitions = Competition::where('is_active', true)->get();

        return Inertia::render('Favorites/Index', [
            'followingTeams' => $teams,
            'followingCompetitions' => $competitions,
        ]);
    }
}

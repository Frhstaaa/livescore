<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Competition;
use App\Services\StandingService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StandingController extends Controller
{
    public function __construct(
        protected StandingService $standingService
    ) {}

    public function index(Request $request): Response
    {
        $activeComp = Competition::where('is_active', true)->first();
        $compId = $request->query('competition_id', $activeComp ? $activeComp->id : 1);

        $standings = $this->standingService->getStandings($compId);
        $competitions = Competition::orderBy('is_active', 'desc')->get();

        return Inertia::render('Standings/Index', [
            'standings' => $standings,
            'competitions' => $competitions,
            'selectedCompetitionId' => (int) $compId,
        ]);
    }
}

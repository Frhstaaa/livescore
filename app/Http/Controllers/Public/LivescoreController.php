<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Competition;
use App\Services\MatchService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LivescoreController extends Controller
{
    public function __construct(
        protected MatchService $matchService
    ) {}

    public function index(Request $request): Response
    {
        $date = $request->query('date', now()->toDateString());
        $competitionId = $request->query('competition_id');

        $data = $this->matchService->getLivescoreData($date, $competitionId);
        $competitions = Competition::orderBy('is_active', 'desc')->get();

        return Inertia::render('Livescore/Index', [
            'matches' => $data['matches'],
            'selectedDate' => $data['selectedDate'],
            'competitions' => $competitions,
            'selectedCompetitionId' => $competitionId,
        ]);
    }
}

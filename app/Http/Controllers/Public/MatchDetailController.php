<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Services\MatchService;
use Inertia\Inertia;
use Inertia\Response;

class MatchDetailController extends Controller
{
    public function __construct(
        protected MatchService $matchService
    ) {}

    public function show(int $id): Response
    {
        $details = $this->matchService->getMatchDetails($id);

        if (empty($details)) {
            abort(404, 'Pertandingan tidak ditemukan');
        }

        return Inertia::render('Livescore/Detail', [
            'match' => $details['match'],
            'h2h' => $details['h2h'],
        ]);
    }
}

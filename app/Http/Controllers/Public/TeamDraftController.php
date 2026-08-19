<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Competition;
use App\Models\Team;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TeamDraftController extends Controller
{
    /**
     * Get real-time team draft distribution data for public view.
     */
    public function getDraftData(Request $request): JsonResponse
    {
        $activeComp = Competition::where('is_active', true)->first();

        if (!$activeComp) {
            return response()->json([
                'success' => false,
                'competition' => null,
                'teams' => [],
            ]);
        }

        // Fetch teams in the active competition standings, or fallback to all teams
        $teams = Team::whereHas('standings', function ($q) use ($activeComp) {
            $q->where('competition_id', $activeComp->id);
        })->with(['players' => function ($q) {
            $q->orderByRaw("CASE 
                WHEN position = 'GK' THEN 1 
                WHEN position = 'DEF' THEN 2 
                WHEN position = 'MID' THEN 3 
                WHEN position = 'FWD' THEN 4 
                ELSE 5 END")
              ->orderBy('name', 'asc');
        }])->get();

        if ($teams->isEmpty()) {
            $teams = Team::with(['players' => function ($q) {
                $q->orderByRaw("CASE 
                    WHEN position = 'GK' THEN 1 
                    WHEN position = 'DEF' THEN 2 
                    WHEN position = 'MID' THEN 3 
                    WHEN position = 'FWD' THEN 4 
                    ELSE 5 END")
                  ->orderBy('name', 'asc');
            }])->get();
        }

        $totalPlayers = $teams->sum(fn ($t) => $t->players->count());

        return response()->json([
            'success' => true,
            'competition' => [
                'id' => $activeComp->id,
                'name' => $activeComp->name,
                'season' => $activeComp->season,
                'show_draft_bubble' => (bool) $activeComp->show_draft_bubble,
            ],
            'total_teams' => $teams->count(),
            'total_players' => $totalPlayers,
            'teams' => $teams,
        ]);
    }
}

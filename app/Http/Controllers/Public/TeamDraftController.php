<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Competition;
use App\Models\Team;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class TeamDraftController extends Controller
{
    /**
     * Get real-time team draft distribution data for public view.
     */
    public function getDraftData(Request $request): JsonResponse
    {
        $activeComp = Competition::where('is_active', true)->first() 
            ?? Competition::first();

        if (!$activeComp) {
            return response()->json([
                'success' => false,
                'is_live' => false,
                'competition' => null,
                'teams' => [],
            ]);
        }

        // Check if there is an active live draft session broadcasted from Admin panel
        $liveDraftSession = Cache::get('live_draft_session_' . $activeComp->id);

        if ($liveDraftSession && !empty($liveDraftSession['teams'])) {
            return response()->json([
                'success' => true,
                'is_live' => true,
                'live_draft' => $liveDraftSession,
                'competition' => [
                    'id' => $activeComp->id,
                    'name' => $activeComp->name,
                    'season' => $activeComp->season,
                    'show_draft_bubble' => (bool) $activeComp->show_draft_bubble,
                ],
                'total_teams' => count($liveDraftSession['teams'] ?? []),
                'total_players' => $liveDraftSession['total_players'] ?? 0,
                'teams' => $liveDraftSession['teams'] ?? [],
            ]);
        }

        // Fallback: Fetch official teams in the active competition standings
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
            'is_live' => false,
            'live_draft' => null,
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

    /**
     * Broadcast and sync live draft state from Admin panel to public.
     */
    public function syncLiveDraft(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'competition_id' => 'required',
            'stage' => 'required|string', // 'setup' | 'spinning' | 'finished' | 'idle'
            'current_draft_index' => 'nullable|integer',
            'total_players' => 'nullable|integer',
            'current_player' => 'nullable|array',
            'active_team_index' => 'nullable|integer',
            'last_drafted' => 'nullable|array',
            'teams' => 'required|array',
        ]);

        $validated['is_live'] = in_array($validated['stage'], ['setup', 'spinning', 'finished']);
        $validated['updated_at'] = now()->toIso8601String();

        Cache::put('live_draft_session_' . $validated['competition_id'], $validated, now()->addHours(6));

        return response()->json([
            'success' => true,
            'message' => 'Live draft state synchronized successfully.'
        ]);
    }

    /**
     * Clear live draft session cache.
     */
    public function clearLiveDraft(Request $request): JsonResponse
    {
        $compId = $request->input('competition_id');
        if ($compId) {
            Cache::forget('live_draft_session_' . $compId);
        }

        return response()->json([
            'success' => true,
            'message' => 'Live draft session cleared.'
        ]);
    }
}

<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MatchModel;
use App\Services\LiveControlService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LiveControlController extends Controller
{
    public function __construct(
        protected LiveControlService $liveService
    ) {}

    public function index(Request $request): Response
    {
        $matches = MatchModel::with(['homeTeam', 'awayTeam', 'competition'])
            ->orderBy('match_date', 'asc')
            ->get();

        $selectedMatchId = $request->query('match_id', $matches->first()?->id);
        $selectedMatch = null;

        if ($selectedMatchId) {
            $selectedMatch = MatchModel::with([
                'homeTeam.players',
                'awayTeam.players',
                'events.player',
                'events.team',
                'bestPlayer'
            ])->find($selectedMatchId);
        }

        return Inertia::render('Admin/LiveControl', [
            'matches' => $matches,
            'selectedMatch' => $selectedMatch,
        ]);
    }

    public function updateStatus(Request $request, int $matchId)
    {
        $validated = $request->validate([
            'status' => 'required|in:scheduled,live,half_time,full_time,postponed,cancelled',
            'minute' => 'nullable|integer',
        ]);

        $this->liveService->updateStatus($matchId, $validated['status'], $validated['minute'] ?? null);
        return back()->with('message', 'Status pertandingan diperbarui');
    }

    public function addEvent(Request $request, int $matchId)
    {
        $validated = $request->validate([
            'team_id' => 'required|exists:teams,id',
            'player_id' => 'nullable|exists:players,id',
            'related_player_id' => 'nullable|exists:players,id',
            'event_type' => 'required|in:goal,yellow_card,red_card,substitution_in,substitution_out,timeout,own_goal',
            'minute' => 'required|integer',
            'extra_info' => 'nullable|string',
        ]);

        $this->liveService->recordEvent($matchId, $validated);
        return back()->with('message', 'Kejadian pertandingan berhasil dicatat');
    }

    public function setMotm(Request $request, int $matchId)
    {
        $validated = $request->validate([
            'player_id' => 'required|exists:players,id',
            'rating' => 'required|numeric|min:1|max:10',
        ]);

        $this->liveService->setManOfTheMatch($matchId, $validated['player_id'], $validated['rating']);
        return back()->with('message', 'Man of the Match berhasil diperbarui');
    }
}

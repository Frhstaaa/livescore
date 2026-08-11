<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Competition;
use App\Models\MatchModel;
use App\Models\Team;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MatchController extends Controller
{
    public function index(): Response
    {
        $matches = MatchModel::with(['competition', 'homeTeam', 'awayTeam'])
            ->orderBy('match_date', 'desc')
            ->get();
        $competitions = Competition::all();
        $teams = Team::all();

        return Inertia::render('Admin/Matches/Index', [
            'matches' => $matches,
            'competitions' => $competitions,
            'teams' => $teams,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'competition_id' => 'required|exists:competitions,id',
            'home_team_id' => 'required|exists:teams,id|different:away_team_id',
            'away_team_id' => 'required|exists:teams,id',
            'match_date' => 'required|date',
            'venue' => 'required|string|max:150',
            'round' => 'required|string|max:50',
        ]);

        $validated['status'] = 'scheduled';
        $validated['created_by'] = auth()->id();

        MatchModel::create($validated);
        return back()->with('message', 'Jadwal pertandingan berhasil dibuat');
    }

    public function destroy(int $id)
    {
        MatchModel::destroy($id);
        return back()->with('message', 'Pertandingan berhasil dihapus');
    }
}

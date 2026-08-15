<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Competition;
use App\Models\MatchModel;
use App\Models\Team;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class MatchController extends Controller
{
    public function index(Request $request): Response
    {
        $selectedCompetitionId = $request->query('competition_id');

        $query = MatchModel::with(['competition', 'homeTeam', 'awayTeam']);
        if ($selectedCompetitionId) {
            $query->where('competition_id', $selectedCompetitionId);
        }

        $matches = $query->orderBy('match_date', 'asc')->get();
        $competitions = Competition::with('standings.team')->orderBy('is_active', 'desc')->get();
        $teams = Team::orderBy('name', 'asc')->get();

        return Inertia::render('Admin/Matches/Index', [
            'matches' => $matches,
            'competitions' => $competitions,
            'teams' => $teams,
            'selectedCompetitionId' => $selectedCompetitionId ? (int)$selectedCompetitionId : null,
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
        return back()->with('success', 'Jadwal pertandingan berhasil dibuat');
    }

    public function generate(Request $request)
    {
        $validated = $request->validate([
            'competition_id' => 'required|exists:competitions,id',
            'matches' => 'required|array|min:1',
            'matches.*.home_team_id' => 'required|exists:teams,id',
            'matches.*.away_team_id' => 'required|exists:teams,id',
            'matches.*.match_date' => 'required|string',
            'matches.*.venue' => 'required|string|max:150',
            'matches.*.round' => 'required|string|max:50',
            'clear_existing' => 'nullable|boolean',
        ]);

        DB::transaction(function () use ($validated) {
            $compId = $validated['competition_id'];

            if (!empty($validated['clear_existing'])) {
                MatchModel::where('competition_id', $compId)
                    ->where('status', 'scheduled')
                    ->delete();
            }

            $userId = auth()->id();
            foreach ($validated['matches'] as $m) {
                MatchModel::create([
                    'competition_id' => $compId,
                    'home_team_id' => $m['home_team_id'],
                    'away_team_id' => $m['away_team_id'],
                    'match_date' => $m['match_date'],
                    'venue' => $m['venue'] ?? 'Rama Futsall Kadipaten',
                    'round' => $m['round'] ?? 'Penyisihan Grup',
                    'status' => 'scheduled',
                    'created_by' => $userId,
                ]);
            }
        });

        return back()->with('success', count($validated['matches']) . ' jadwal pertandingan liga berhasil di-generate secara adil dan disimpan ke database!');
    }

    public function clearCompetitionMatches(Request $request, int $competitionId)
    {
        MatchModel::where('competition_id', $competitionId)
            ->where('status', 'scheduled')
            ->delete();

        return back()->with('success', 'Seluruh jadwal pertandingan berstatus "scheduled" pada turnamen ini berhasil dibersihkan.');
    }

    public function destroy(int $id)
    {
        MatchModel::destroy($id);
        return back()->with('success', 'Pertandingan berhasil dihapus');
    }
}

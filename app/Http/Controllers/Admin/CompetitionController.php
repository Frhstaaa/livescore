<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Competition;
use App\Models\Standing;
use App\Models\Team;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CompetitionController extends Controller
{
    public function index(): Response
    {
        $competitions = Competition::with('standings.team')->orderBy('created_at', 'desc')->get();
        $allTeams = Team::orderBy('name', 'asc')->get();

        return Inertia::render('Admin/Competitions/Index', [
            'competitions' => $competitions,
            'allTeams' => $allTeams,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'season' => 'required|string|max:50',
            'type' => 'required|in:league,knockout,group',
            'match_duration_minutes' => 'required|integer|min:5|max:180',
            'half_duration_minutes' => 'required|integer|min:5|max:90',
            'half_time_duration_minutes' => 'required|integer|min:1|max:60',
            'points_win' => 'required|integer',
            'points_draw' => 'required|integer',
            'points_loss' => 'required|integer',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'is_active' => 'boolean',
            'show_draft_bubble' => 'boolean',
            'about_description' => 'nullable|string',
        ]);

        if (!empty($validated['is_active']) && $validated['is_active']) {
            Competition::where('is_active', true)->update(['is_active' => false]);
        }

        Competition::create($validated);
        return back()->with('message', 'Kompetisi futsal baru berhasil dibuat');
    }

    public function update(Request $request, int $id)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'season' => 'required|string|max:50',
            'type' => 'required|in:league,knockout,group',
            'match_duration_minutes' => 'required|integer|min:5|max:180',
            'half_duration_minutes' => 'required|integer|min:5|max:90',
            'half_time_duration_minutes' => 'required|integer|min:1|max:60',
            'points_win' => 'required|integer',
            'points_draw' => 'required|integer',
            'points_loss' => 'required|integer',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'is_active' => 'boolean',
            'show_draft_bubble' => 'boolean',
            'about_description' => 'nullable|string',
        ]);

        if (!empty($validated['is_active']) && $validated['is_active']) {
            Competition::where('id', '!=', $id)->update(['is_active' => false]);
        }

        $competition = Competition::findOrFail($id);
        $competition->update($validated);
        return back()->with('message', 'Pengaturan kompetisi berhasil diperbarui');
    }

    public function toggleDraftBubble(Request $request, int $id)
    {
        $competition = Competition::findOrFail($id);
        
        if ($request->has('show_draft_bubble')) {
            $val = $request->input('show_draft_bubble');
            $newState = ($val === true || $val === 'true' || $val === 1 || $val === '1');
        } else {
            $newState = !$competition->show_draft_bubble;
        }

        $competition->update(['show_draft_bubble' => $newState]);

        $statusText = $newState ? 'ditampilkan' : 'disembunyikan';
        return back()->with('message', "Bubble Pembagian Tim di publik berhasil {$statusText}.");
    }

    public function syncTeams(Request $request, int $id)
    {
        $validated = $request->validate([
            'team_ids' => 'nullable|array',
            'team_ids.*' => 'exists:teams,id',
        ]);

        $competition = Competition::findOrFail($id);
        $selectedTeamIds = $validated['team_ids'] ?? [];

        // Add selected teams to standings if not existing
        foreach ($selectedTeamIds as $tId) {
            Standing::firstOrCreate(
                ['competition_id' => $id, 'team_id' => $tId],
                ['played' => 0, 'win' => 0, 'draw' => 0, 'lose' => 0, 'points' => 0]
            );
        }

        // Remove unselected teams if played is 0
        Standing::where('competition_id', $id)
            ->whereNotIn('team_id', $selectedTeamIds)
            ->where('played', 0)
            ->delete();

        return back()->with('message', "Daftar tim peserta '{$competition->name}' berhasil diperbarui.");
    }

    public function setActive(int $id)
    {
        Competition::query()->update(['is_active' => false]);
        $competition = Competition::findOrFail($id);
        $competition->update(['is_active' => true]);

        return back()->with('message', "Kompetisi '{$competition->name}' diaktifkan sebagai kompetisi utama.");
    }

    public function destroy(int $id)
    {
        Competition::destroy($id);
        return back()->with('message', 'Kompetisi berhasil dihapus');
    }
}

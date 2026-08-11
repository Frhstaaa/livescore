<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Competition;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CompetitionController extends Controller
{
    public function index(): Response
    {
        $competitions = Competition::orderBy('created_at', 'desc')->get();
        return Inertia::render('Admin/Competitions/Index', ['competitions' => $competitions]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'season' => 'required|string|max:50',
            'type' => 'required|in:league,knockout,group',
            'match_duration_minutes' => 'required|integer|min:10|max:120',
            'half_duration_minutes' => 'required|integer|min:5|max:60',
            'points_win' => 'required|integer',
            'points_draw' => 'required|integer',
            'points_loss' => 'required|integer',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'is_active' => 'boolean',
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
            'match_duration_minutes' => 'required|integer|min:10|max:120',
            'half_duration_minutes' => 'required|integer|min:5|max:60',
            'points_win' => 'required|integer',
            'points_draw' => 'required|integer',
            'points_loss' => 'required|integer',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'is_active' => 'boolean',
            'about_description' => 'nullable|string',
        ]);

        if (!empty($validated['is_active']) && $validated['is_active']) {
            Competition::where('id', '!=', $id)->update(['is_active' => false]);
        }

        $competition = Competition::findOrFail($id);
        $competition->update($validated);
        return back()->with('message', 'Pengaturan kompetisi berhasil diperbarui');
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

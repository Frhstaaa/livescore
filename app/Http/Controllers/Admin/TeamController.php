<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Helpers\ImageHelper;
use App\Repositories\Contracts\TeamRepositoryInterface;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TeamController extends Controller
{
    public function __construct(
        protected TeamRepositoryInterface $teamRepo
    ) {}

    public function index(): Response
    {
        $teams = $this->teamRepo->getAllTeams();
        $pendingRegistrants = \App\Models\Registrant::where('status', 'pending')
            ->orderBy('id', 'desc')
            ->get(['id', 'name', 'position', 'phone', 'competition_id']);

        return Inertia::render('Admin/Teams/Index', [
            'teams' => $teams,
            'pendingRegistrants' => $pendingRegistrants,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'short_name' => 'required|string|max:10',
            'logo_url' => 'nullable|string',
            'logo_file' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:5120',
            'coach_name' => 'nullable|string|max:100',
            'founded_year' => 'nullable|integer',
        ]);

        if ($request->hasFile('logo_file')) {
            $validated['logo_url'] = ImageHelper::convertToWebp($request->file('logo_file'), 'uploads/teams');
        }

        unset($validated['logo_file']);

        $this->teamRepo->createTeam($validated);
        return back()->with('message', 'Tim & Logo (.webp) berhasil ditambahkan');
    }

    public function update(Request $request, int $id)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'short_name' => 'required|string|max:10',
            'logo_url' => 'nullable|string',
            'logo_file' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:5120',
            'coach_name' => 'nullable|string|max:100',
            'founded_year' => 'nullable|integer',
        ]);

        if ($request->hasFile('logo_file')) {
            $validated['logo_url'] = ImageHelper::convertToWebp($request->file('logo_file'), 'uploads/teams');
        }

        unset($validated['logo_file']);

        $this->teamRepo->updateTeam($id, $validated);
        return back()->with('message', 'Tim & Logo (.webp) berhasil diperbarui');
    }

    public function destroy(int $id)
    {
        $this->teamRepo->deleteTeam($id);
        return back()->with('message', 'Tim berhasil dihapus');
    }
}

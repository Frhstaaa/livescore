<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Team;
use App\Repositories\Contracts\PlayerRepositoryInterface;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PlayerController extends Controller
{
    public function __construct(
        protected PlayerRepositoryInterface $playerRepo
    ) {}

    public function index(Request $request): Response
    {
        $teamId = $request->query('team_id');
        $players = $this->playerRepo->getAllPlayers($teamId ? (int)$teamId : null);
        $teams = Team::orderBy('name', 'asc')->get();

        return Inertia::render('Admin/Players/Index', [
            'players' => $players,
            'teams' => $teams,
            'selectedTeamId' => $teamId ? (int)$teamId : null,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'team_id' => 'required|exists:teams,id',
            'name' => 'required|string|max:100',
            'jersey_number' => 'required|integer',
            'position' => 'required|in:GK,DEF,MID,FWD',
            'photo_url' => 'nullable|string',
            'date_of_birth' => 'nullable|date',
        ]);

        $this->playerRepo->createPlayer($validated);
        return back()->with('message', 'Pemain berhasil ditambahkan');
    }

    public function update(Request $request, int $id)
    {
        $validated = $request->validate([
            'team_id' => 'required|exists:teams,id',
            'name' => 'required|string|max:100',
            'jersey_number' => 'required|integer',
            'position' => 'required|in:GK,DEF,MID,FWD',
            'photo_url' => 'nullable|string',
            'date_of_birth' => 'nullable|date',
        ]);

        $this->playerRepo->updatePlayer($id, $validated);
        return back()->with('message', 'Pemain berhasil diperbarui');
    }

    public function destroy(int $id)
    {
        $this->playerRepo->deletePlayer($id);
        return back()->with('message', 'Pemain berhasil dihapus');
    }
}

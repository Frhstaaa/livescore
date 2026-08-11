<?php

namespace App\Repositories\Eloquent;

use App\Models\Team;
use App\Repositories\Contracts\TeamRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class TeamRepository implements TeamRepositoryInterface
{
    public function getAllTeams(): Collection
    {
        return Team::withCount('players')->orderBy('name', 'asc')->get();
    }

    public function getTeamById(int $id): ?Team
    {
        return Team::with('players')->find($id);
    }

    public function createTeam(array $data): Team
    {
        return Team::create($data);
    }

    public function updateTeam(int $id, array $data): Team
    {
        $team = Team::findOrFail($id);
        $team->update($data);
        return $team;
    }

    public function deleteTeam(int $id): bool
    {
        $team = Team::findOrFail($id);
        return (bool) $team->delete();
    }
}

<?php

namespace App\Repositories\Contracts;

use App\Models\Team;
use Illuminate\Database\Eloquent\Collection;

interface TeamRepositoryInterface
{
    public function getAllTeams(): Collection;
    public function getTeamById(int $id): ?Team;
    public function createTeam(array $data): Team;
    public function updateTeam(int $id, array $data): Team;
    public function deleteTeam(int $id): bool;
}

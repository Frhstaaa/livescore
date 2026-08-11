<?php

namespace App\Repositories\Contracts;

use App\Models\Player;
use Illuminate\Database\Eloquent\Collection;

interface PlayerRepositoryInterface
{
    public function getAllPlayers(?int $teamId = null): Collection;
    public function getPlayerById(int $id): ?Player;
    public function createPlayer(array $data): Player;
    public function updatePlayer(int $id, array $data): Player;
    public function deletePlayer(int $id): bool;
}

<?php

namespace App\Repositories\Eloquent;

use App\Models\Player;
use App\Repositories\Contracts\PlayerRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class PlayerRepository implements PlayerRepositoryInterface
{
    public function getAllPlayers(?int $teamId = null): Collection
    {
        $query = Player::with('team')->orderBy('name', 'asc');

        if ($teamId) {
            $query->where('team_id', $teamId);
        }

        return $query->get();
    }

    public function getPlayerById(int $id): ?Player
    {
        return Player::with(['team', 'seasonStats.competition'])->find($id);
    }

    public function createPlayer(array $data): Player
    {
        return Player::create($data);
    }

    public function updatePlayer(int $id, array $data): Player
    {
        $player = Player::findOrFail($id);
        $player->update($data);
        return $player;
    }

    public function deletePlayer(int $id): bool
    {
        $player = Player::findOrFail($id);
        return (bool) $player->delete();
    }
}

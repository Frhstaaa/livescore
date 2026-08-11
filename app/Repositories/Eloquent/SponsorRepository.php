<?php

namespace App\Repositories\Eloquent;

use App\Models\Sponsor;
use App\Repositories\Contracts\SponsorRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class SponsorRepository implements SponsorRepositoryInterface
{
    public function getAllSponsors(): Collection
    {
        return Sponsor::orderBy('order', 'asc')->orderBy('name', 'asc')->get();
    }

    public function getSponsorsByTier(string $tier): Collection
    {
        return Sponsor::where('tier', $tier)->orderBy('order', 'asc')->get();
    }

    public function createSponsor(array $data): Sponsor
    {
        return Sponsor::create($data);
    }

    public function updateSponsor(int $id, array $data): Sponsor
    {
        $sponsor = Sponsor::findOrFail($id);
        $sponsor->update($data);
        return $sponsor;
    }

    public function deleteSponsor(int $id): bool
    {
        $sponsor = Sponsor::findOrFail($id);
        return (bool) $sponsor->delete();
    }
}

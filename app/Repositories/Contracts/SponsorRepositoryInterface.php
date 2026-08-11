<?php

namespace App\Repositories\Contracts;

use App\Models\Sponsor;
use Illuminate\Database\Eloquent\Collection;

interface SponsorRepositoryInterface
{
    public function getAllSponsors(): Collection;
    public function getSponsorsByTier(string $tier): Collection;
    public function createSponsor(array $data): Sponsor;
    public function updateSponsor(int $id, array $data): Sponsor;
    public function deleteSponsor(int $id): bool;
}

<?php

namespace App\Services;

use App\Repositories\Contracts\SponsorRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class SponsorService
{
    public function __construct(
        protected SponsorRepositoryInterface $sponsorRepo
    ) {}

    public function getGroupedSponsors(): array
    {
        $all = $this->sponsorRepo->getAllSponsors();

        return [
            'main' => $all->where('tier', 'main')->values(),
            'gold' => $all->where('tier', 'gold')->values(),
            'silver' => $all->where('tier', 'silver')->values(),
            'partner' => $all->where('tier', 'partner')->values(),
            'media' => $all->where('tier', 'media')->values(),
        ];
    }
}

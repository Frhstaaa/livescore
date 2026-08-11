<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Competition;
use App\Services\SponsorService;
use Inertia\Inertia;
use Inertia\Response;

class AboutController extends Controller
{
    public function __construct(
        protected SponsorService $sponsorService
    ) {}

    public function index(): Response
    {
        $sponsors = $this->sponsorService->getGroupedSponsors();
        $competition = Competition::where('is_active', true)->first();

        return Inertia::render('About/Index', [
            'sponsors' => $sponsors,
            'competition' => $competition,
        ]);
    }
}

<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Competition;
use App\Repositories\Contracts\SponsorRepositoryInterface;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SponsorController extends Controller
{
    public function __construct(
        protected SponsorRepositoryInterface $sponsorRepo
    ) {}

    public function index(): Response
    {
        $sponsors = $this->sponsorRepo->getAllSponsors();
        $competition = Competition::where('is_active', true)->first();

        return Inertia::render('Admin/Sponsors/Index', [
            'sponsors' => $sponsors,
            'competition' => $competition,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'logo_url' => 'nullable|string',
            'logo_file' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:5120',
            'tier' => 'required|in:main,gold,silver,partner,media',
            'website_url' => 'nullable|string',
            'order' => 'nullable|integer',
        ]);

        if ($request->hasFile('logo_file')) {
            $validated['logo_url'] = \App\Helpers\ImageHelper::convertToWebp($request->file('logo_file'), 'uploads/sponsors');
        }

        unset($validated['logo_file']);

        $this->sponsorRepo->createSponsor($validated);
        return back()->with('message', 'Sponsor berhasil ditambahkan');
    }

    public function update(Request $request, int $id)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'logo_url' => 'nullable|string',
            'logo_file' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:5120',
            'tier' => 'required|in:main,gold,silver,partner,media',
            'website_url' => 'nullable|string',
            'order' => 'nullable|integer',
        ]);

        if ($request->hasFile('logo_file')) {
            $validated['logo_url'] = \App\Helpers\ImageHelper::convertToWebp($request->file('logo_file'), 'uploads/sponsors');
        }

        unset($validated['logo_file']);

        $this->sponsorRepo->updateSponsor($id, $validated);
        return back()->with('message', 'Sponsor berhasil diperbarui');
    }

    public function destroy(int $id)
    {
        $this->sponsorRepo->deleteSponsor($id);
        return back()->with('message', 'Sponsor berhasil dihapus');
    }

    public function updateAbout(Request $request)
    {
        $validated = $request->validate([
            'about_description' => 'nullable|string',
        ]);

        $competition = Competition::where('is_active', true)->first();
        if ($competition) {
            $competition->update(['about_description' => $validated['about_description']]);
        }

        return back()->with('message', 'Informasi About & Sponsor berhasil diperbarui');
    }
}

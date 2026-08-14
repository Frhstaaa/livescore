<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Competition;
use App\Models\Registrant;
use Inertia\Inertia;

class RegistrationController extends Controller
{
    public function index()
    {
        $competitions = Competition::orderBy('is_active', 'desc')
            ->orderBy('id', 'desc')
            ->get(['id', 'name', 'season', 'type', 'is_active']);

        return Inertia::render('Public/Register', [
            'competitions' => $competitions
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'competition_id' => 'required|exists:competitions,id',
            'name' => 'required|string|max:100',
            'phone' => 'nullable|string|max:20',
            'position' => 'required|in:GK,DEF,MID,FWD',
        ]);

        $validated['status'] = 'pending';

        Registrant::create($validated);

        return redirect()->back()->with('success', 'Pendaftaran berhasil! Silakan tunggu informasi selanjutnya.');
    }
}

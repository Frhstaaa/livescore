<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Competition;
use App\Models\Player;
use App\Models\Registrant;
use App\Models\Standing;
use App\Models\Team;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class RegistrationController extends Controller
{
    public function index(Request $request)
    {
        $competitions = Competition::orderBy('id', 'desc')->get();
        $competition_id = $request->query('competition_id', $competitions->first()->id ?? null);
        
        $registrants = Registrant::with('competition')
            ->when($competition_id, function ($q) use ($competition_id) {
                return $q->where('competition_id', $competition_id);
            })
            ->orderBy('id', 'desc')
            ->get();

        $teams = Team::orderBy('name', 'asc')->get(['id', 'name', 'short_name']);

        return Inertia::render('Admin/Registrants/Index', [
            'registrants' => $registrants,
            'competitions' => $competitions,
            'teams' => $teams,
            'filters' => ['competition_id' => $competition_id ? (int) $competition_id : null]
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'competition_id' => 'required|exists:competitions,id',
            'name' => 'required|string|max:100',
            'phone' => 'nullable|string|max:20',
            'position' => 'required|string|max:50',
        ]);

        $validated['status'] = 'pending';
        Registrant::create($validated);

        return redirect()->back()->with('success', 'Pendaftar baru berhasil ditambahkan.');
    }

    public function destroy($id)
    {
        $registrant = Registrant::findOrFail($id);
        $registrant->delete();

        return redirect()->back()->with('success', 'Data pendaftar berhasil dihapus.');
    }

    public function updateStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,assigned',
        ]);

        $registrant = Registrant::findOrFail($id);
        $registrant->update(['status' => $validated['status']]);

        return redirect()->back()->with('success', 'Status pendaftar berhasil diubah menjadi ' . $validated['status']);
    }

    public function assignToTeam(Request $request, $id)
    {
        $validated = $request->validate([
            'team_id' => 'required|exists:teams,id',
        ]);

        $registrant = Registrant::findOrFail($id);

        Player::create([
            'team_id' => $validated['team_id'],
            'name' => $registrant->name,
            'jersey_number' => rand(1, 99),
            'position' => $registrant->position,
        ]);

        $registrant->update(['status' => 'assigned']);

        return redirect()->back()->with('success', 'Pemain berhasil dimasukkan ke dalam tim pilihan.');
    }

    public function randomize(Request $request)
    {
        $request->validate([
            'competition_id' => 'required|exists:competitions,id',
            'teams_count' => 'nullable|integer|min:2',
            'custom_teams' => 'nullable|array|min:2',
        ]);

        $competition_id = $request->competition_id;
        $custom_teams = $request->custom_teams;

        DB::beginTransaction();

        try {
            if ($custom_teams && is_array($custom_teams) && count($custom_teams) >= 2) {
                // Save custom results generated from the interactive Roulette draw
                $totalAssigned = 0;

                foreach ($custom_teams as $idx => $teamData) {
                    $teamName = !empty($teamData['name']) ? $teamData['name'] : 'Tim ' . ($idx + 1);
                    $teamShort = !empty($teamData['short_name']) ? $teamData['short_name'] : 'T' . ($idx + 1);

                    $team = Team::create([
                        'name' => $teamName,
                        'short_name' => substr($teamShort, 0, 5),
                    ]);

                    // Create Standings
                    Standing::create([
                        'competition_id' => $competition_id,
                        'team_id' => $team->id,
                        'played' => 0,
                        'won' => 0,
                        'drawn' => 0,
                        'lost' => 0,
                        'goals_for' => 0,
                        'goals_against' => 0,
                        'goal_difference' => 0,
                        'points' => 0,
                    ]);

                    $playerIds = $teamData['registrant_ids'] ?? [];
                    if (!empty($playerIds)) {
                        $registrantsToAssign = Registrant::whereIn('id', $playerIds)->get();
                        foreach ($registrantsToAssign as $reg) {
                            Player::create([
                                'team_id' => $team->id,
                                'name' => $reg->name,
                                'jersey_number' => rand(1, 99),
                                'position' => $reg->position,
                            ]);
                            $reg->update(['status' => 'assigned']);
                            $totalAssigned++;
                        }
                    }
                }

                DB::commit();

                return redirect()->back()->with('success', 'Berhasil menyimpan hasil undian Roulette! ' . $totalAssigned . ' pemain telah resmi masuk ke dalam ' . count($custom_teams) . ' tim.');
            }

            // Fallback: Automated random distribution
            $teams_count = (int) ($request->teams_count ?? 2);
            $registrants = Registrant::where('competition_id', $competition_id)
                ->where('status', 'pending')
                ->get();

            if ($registrants->count() < $teams_count) {
                return redirect()->back()->with('error', 'Jumlah pendaftar pending (' . $registrants->count() . ') lebih sedikit dari jumlah tim yang ingin dibuat (' . $teams_count . ').');
            }

            $shuffledRegistrants = $registrants->shuffle();

            $teams = [];
            for ($i = 1; $i <= $teams_count; $i++) {
                $team = Team::create([
                    'name' => 'Tim Futsal ' . $i,
                    'short_name' => 'TF' . $i,
                ]);

                Standing::create([
                    'competition_id' => $competition_id,
                    'team_id' => $team->id,
                    'played' => 0,
                    'won' => 0,
                    'drawn' => 0,
                    'lost' => 0,
                    'goals_for' => 0,
                    'goals_against' => 0,
                    'goal_difference' => 0,
                    'points' => 0,
                ]);

                $teams[] = $team;
            }

            foreach ($shuffledRegistrants as $index => $registrant) {
                $teamIndex = $index % $teams_count;
                $team = $teams[$teamIndex];

                Player::create([
                    'team_id' => $team->id,
                    'name' => $registrant->name,
                    'jersey_number' => rand(1, 99),
                    'position' => $registrant->position,
                ]);

                $registrant->update(['status' => 'assigned']);
            }

            DB::commit();

            return redirect()->back()->with('success', 'Berhasil mengacak ' . $registrants->count() . ' pendaftar ke dalam ' . $teams_count . ' tim baru.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Terjadi kesalahan saat mengacak tim: ' . $e->getMessage());
        }
    }
}

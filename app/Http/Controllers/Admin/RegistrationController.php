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
            'position' => 'required|in:GK,DEF,MID,FWD',
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
            'teams_count' => 'required|integer|min:2',
        ]);

        $competition_id = $request->competition_id;
        $teams_count = (int) $request->teams_count;

        $registrants = Registrant::where('competition_id', $competition_id)
            ->where('status', 'pending')
            ->get();

        if ($registrants->count() < $teams_count) {
            return redirect()->back()->with('error', 'Jumlah pendaftar pending (' . $registrants->count() . ') lebih sedikit dari jumlah tim yang ingin dibuat (' . $teams_count . ').');
        }

        // Shuffle registrants
        $shuffledRegistrants = $registrants->shuffle();

        DB::beginTransaction();

        try {
            // Create Teams
            $teams = [];
            for ($i = 1; $i <= $teams_count; $i++) {
                $team = Team::create([
                    'name' => 'Tim Futsal ' . $i,
                    'short_name' => 'TF' . $i,
                ]);

                // Register team to competition standings
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

            // Distribute players to teams using round-robin
            foreach ($shuffledRegistrants as $index => $registrant) {
                $teamIndex = $index % $teams_count;
                $team = $teams[$teamIndex];

                // Create Player
                Player::create([
                    'team_id' => $team->id,
                    'name' => $registrant->name,
                    'jersey_number' => rand(1, 99),
                    'position' => $registrant->position,
                ]);

                // Update registrant status
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

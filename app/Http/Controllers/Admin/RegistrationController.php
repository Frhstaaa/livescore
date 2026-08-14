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

        return Inertia::render('Admin/Registrants/Index', [
            'registrants' => $registrants,
            'competitions' => $competitions,
            'filters' => ['competition_id' => $competition_id]
        ]);
    }

    public function randomize(Request $request)
    {
        $request->validate([
            'competition_id' => 'required|exists:competitions,id',
            'teams_count' => 'required|integer|min:2',
        ]);

        $competition_id = $request->competition_id;
        $teams_count = $request->teams_count;

        $registrants = Registrant::where('competition_id', $competition_id)
            ->where('status', 'pending')
            ->get();

        if ($registrants->count() < $teams_count) {
            return redirect()->back()->with('error', 'Jumlah pendaftar (' . $registrants->count() . ') lebih sedikit dari jumlah tim yang ingin dibuat (' . $teams_count . ').');
        }

        // Shuffle registrants
        $shuffledRegistrants = $registrants->shuffle();

        DB::beginTransaction();

        try {
            // Create Teams
            $teams = [];
            for ($i = 1; $i <= $teams_count; $i++) {
                $team = Team::create([
                    'name' => 'Tim ' . $i,
                    'short_name' => 'T' . $i,
                ]);

                // Register team to competition standings
                Standing::create([
                    'competition_id' => $competition_id,
                    'team_id' => $team->id,
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

            return redirect()->back()->with('success', 'Berhasil mengacak ' . $registrants->count() . ' pemain ke dalam ' . $teams_count . ' tim.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Terjadi kesalahan saat mengacak tim: ' . $e->getMessage());
        }
    }
}

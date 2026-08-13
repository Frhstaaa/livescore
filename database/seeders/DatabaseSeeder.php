<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Competition;
use App\Models\Team;
use App\Models\Player;
use App\Models\MatchModel;
use App\Models\MatchEvent;
use App\Models\MatchStatistic;
use App\Models\MatchLineup;
use App\Models\Standing;
use App\Models\PlayerSeasonStat;
use App\Models\Sponsor;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Admin User
        $admin = User::create([
            'name' => 'Admin RS Livasya',
            'email' => 'admin@livasya.com',
            'password' => Hash::make('password'),
            'role' => 'super_admin',
            'is_active' => true,
        ]);

        // 2. Competitions (Multiple Tournaments)
        $comp = Competition::create([
            'name' => 'RS LIVASYA FUTSAL CUP 2026',
            'season' => '2026',
            'type' => 'league',
            'match_duration_minutes' => 40,
            'half_duration_minutes' => 20,
            'points_win' => 3,
            'points_draw' => 1,
            'points_loss' => 0,
            'start_date' => '2026-08-01',
            'end_date' => '2026-08-30',
            'is_active' => true,
            'about_description' => 'Kompetisi Futsal Bergengsi RS LIVASYA FUTSAL CUP 2026 diselenggarakan oleh Rumah Sakit LIVASYA untuk memajukan olahraga futsal, gaya hidup sehat, serta mempererat solidaritas antar-tim futsal profesional & komunitas.',
        ]);

        $comp2 = Competition::create([
            'name' => 'LIVASYA CORPORATE LEAGUE 2026',
            'season' => '2026',
            'type' => 'league',
            'match_duration_minutes' => 30,
            'half_duration_minutes' => 15,
            'points_win' => 3,
            'points_draw' => 1,
            'points_loss' => 0,
            'start_date' => '2026-09-01',
            'end_date' => '2026-09-20',
            'is_active' => false,
            'about_description' => 'Liga Futsal Antar Perusahaan & Mitra Medis RS LIVASYA.',
        ]);

        $comp3 = Competition::create([
            'name' => 'PIALA BERGILIR DIREKTUR LIVASYA',
            'season' => '2026',
            'type' => 'knockout',
            'match_duration_minutes' => 40,
            'half_duration_minutes' => 20,
            'points_win' => 3,
            'points_draw' => 1,
            'points_loss' => 0,
            'start_date' => '2026-10-01',
            'end_date' => '2026-10-15',
            'is_active' => false,
            'about_description' => 'Turnamen Futsal Sistem Gugur (Cup) Piala Bergilir Direktur RS Livasya.',
        ]);

        // 3. Sponsors
        Sponsor::create([
            'name' => 'RUMAH SAKIT LIVASYA',
            'tier' => 'main',
            'website_url' => 'https://rslivasya.com',
            'order' => 1,
        ]);
        Sponsor::create([
            'name' => 'Specs Indonesia',
            'tier' => 'gold',
            'website_url' => 'https://specs.id',
            'order' => 2,
        ]);
        Sponsor::create([
            'name' => 'Mizuno Sport',
            'tier' => 'gold',
            'website_url' => 'https://mizuno.id',
            'order' => 3,
        ]);
        Sponsor::create([
            'name' => 'Pocari Sweat',
            'tier' => 'partner',
            'website_url' => 'https://pocarisweat.id',
            'order' => 4,
        ]);
        Sponsor::create([
            'name' => 'Futsal Zone Indonesia',
            'tier' => 'media',
            'website_url' => 'https://futsalzone.id',
            'order' => 5,
        ]);

        // 4. Teams
        $teamsData = [
            ['name' => 'RS Livasya FC', 'short_name' => 'LIV', 'coach_name' => 'Dr. Farhan', 'founded_year' => 2020],
            ['name' => 'Garuda Futsal', 'short_name' => 'GAR', 'coach_name' => 'Coach Budi', 'founded_year' => 2018],
            ['name' => 'Bintang Timur', 'short_name' => 'BTM', 'coach_name' => 'Coach Hector', 'founded_year' => 2017],
            ['name' => 'Black Steel FC', 'short_name' => 'BLK', 'coach_name' => 'Coach Rakhmat', 'founded_year' => 2016],
            ['name' => 'Kancil BBK', 'short_name' => 'KCL', 'coach_name' => 'Coach Yudi', 'founded_year' => 2019],
            ['name' => 'Vamos FC', 'short_name' => 'VMS', 'coach_name' => 'Coach Bonsu', 'founded_year' => 2015],
        ];

        $teams = [];
        foreach ($teamsData as $tData) {
            $teams[] = Team::create($tData);
        }

        // 5. Players
        $playersPerTeam = [
            0 => [
                ['name' => 'Rizki Septian', 'jersey' => 10, 'pos' => 'FWD'],
                ['name' => 'Dr. Andi Wijaya', 'jersey' => 7, 'pos' => 'MID'],
                ['name' => 'Ahmad Subandi', 'jersey' => 4, 'pos' => 'DEF'],
                ['name' => 'Kurnia Meiga', 'jersey' => 1, 'pos' => 'GK'],
                ['name' => 'Bagas Maulana', 'jersey' => 9, 'pos' => 'FWD'],
            ],
            1 => [
                ['name' => 'Syauqi Saud', 'jersey' => 11, 'pos' => 'FWD'],
                ['name' => 'Rio Pangestu', 'jersey' => 5, 'pos' => 'DEF'],
                ['name' => 'Muhammad Albagir', 'jersey' => 2, 'pos' => 'GK'],
                ['name' => 'Ardiansyah Runtuboy', 'jersey' => 12, 'pos' => 'MID'],
                ['name' => 'Sunny Rizky', 'jersey' => 3, 'pos' => 'DEF'],
            ],
            2 => [
                ['name' => 'Dieguinho', 'jersey' => 88, 'pos' => 'FWD'],
                ['name' => 'Iqbal Iskandar', 'jersey' => 6, 'pos' => 'MID'],
                ['name' => 'Nazil Tamamuni', 'jersey' => 13, 'pos' => 'GK'],
                ['name' => 'Guntur Sulistyo', 'jersey' => 14, 'pos' => 'DEF'],
                ['name' => 'M. Subhan', 'jersey' => 15, 'pos' => 'FWD'],
            ],
            3 => [
                ['name' => 'Evan Soumilena', 'jersey' => 9, 'pos' => 'FWD'],
                ['name' => 'Holypaul Soumilena', 'jersey' => 8, 'pos' => 'MID'],
                ['name' => 'Wendy Brian', 'jersey' => 17, 'pos' => 'FWD'],
                ['name' => 'Nazar', 'jersey' => 20, 'pos' => 'GK'],
                ['name' => 'Samuel Eko', 'jersey' => 10, 'pos' => 'FWD'],
            ],
            4 => [
                ['name' => 'Filippo Inzaghi', 'jersey' => 9, 'pos' => 'FWD'],
                ['name' => 'Dias Riansyah', 'jersey' => 7, 'pos' => 'MID'],
                ['name' => 'Marvin Alexa', 'jersey' => 4, 'pos' => 'DEF'],
                ['name' => 'Bambang Bayu', 'jersey' => 1, 'pos' => 'GK'],
                ['name' => 'Refani Putra', 'jersey' => 11, 'pos' => 'FWD'],
            ],
            5 => [
                ['name' => 'Andri Kustiawan', 'jersey' => 10, 'pos' => 'FWD'],
                ['name' => 'Bambang Bayu Saptaji', 'jersey' => 12, 'pos' => 'FWD'],
                ['name' => 'Al-Farabi', 'jersey' => 2, 'pos' => 'DEF'],
                ['name' => 'Gusti Dian', 'jersey' => 1, 'pos' => 'GK'],
                ['name' => 'Randi Satria', 'jersey' => 14, 'pos' => 'MID'],
            ],
        ];

        $createdPlayers = [];
        foreach ($playersPerTeam as $tIdx => $pList) {
            foreach ($pList as $p) {
                $createdPlayers[] = Player::create([
                    'team_id' => $teams[$tIdx]->id,
                    'name' => $p['name'],
                    'jersey_number' => $p['jersey'],
                    'position' => $p['pos'],
                    'is_active' => true,
                ]);
            }
        }

        // 6. Matches
        $m1 = MatchModel::create([
            'competition_id' => $comp->id,
            'home_team_id' => $teams[0]->id,
            'away_team_id' => $teams[1]->id,
            'match_date' => now(),
            'venue' => 'Rama Futsall Kadipaten',
            'status' => 'live',
            'current_minute' => 32,
            'home_score' => 3,
            'away_score' => 2,
            'round' => 'Grup A - Matchday 3',
            'best_player_id' => $createdPlayers[0]->id,
            'best_player_rating' => 8.5,
            'created_by' => $admin->id,
        ]);

        MatchEvent::create(['match_id' => $m1->id, 'team_id' => $teams[0]->id, 'player_id' => $createdPlayers[0]->id, 'event_type' => 'goal', 'minute' => 8]);
        MatchEvent::create(['match_id' => $m1->id, 'team_id' => $teams[1]->id, 'player_id' => $createdPlayers[5]->id, 'event_type' => 'goal', 'minute' => 14]);
        MatchEvent::create(['match_id' => $m1->id, 'team_id' => $teams[0]->id, 'player_id' => $createdPlayers[1]->id, 'event_type' => 'goal', 'minute' => 19]);
        MatchEvent::create(['match_id' => $m1->id, 'team_id' => $teams[1]->id, 'player_id' => $createdPlayers[8]->id, 'event_type' => 'yellow_card', 'minute' => 22]);

        $m2 = MatchModel::create([
            'competition_id' => $comp->id,
            'home_team_id' => $teams[2]->id,
            'away_team_id' => $teams[3]->id,
            'match_date' => now()->subHours(3),
            'venue' => 'Rama Futsall Kadipaten',
            'status' => 'full_time',
            'current_minute' => 40,
            'home_score' => 4,
            'away_score' => 2,
            'round' => 'Grup A - Matchday 3',
            'best_player_id' => $createdPlayers[10]->id,
            'best_player_rating' => 9.2,
            'created_by' => $admin->id,
        ]);

        MatchModel::create([
            'competition_id' => $comp->id,
            'home_team_id' => $teams[4]->id,
            'away_team_id' => $teams[5]->id,
            'match_date' => now()->addHours(4),
            'venue' => 'Rama Futsall Kadipaten',
            'status' => 'scheduled',
            'current_minute' => 0,
            'home_score' => 0,
            'away_score' => 0,
            'round' => 'Grup B - Matchday 3',
            'created_by' => $admin->id,
        ]);

        // Matches for Corporate League (comp2)
        MatchModel::create([
            'competition_id' => $comp2->id,
            'home_team_id' => $teams[0]->id,
            'away_team_id' => $teams[2]->id,
            'match_date' => now(),
            'venue' => 'Rama Futsall Kadipaten',
            'status' => 'live',
            'current_minute' => 18,
            'home_score' => 1,
            'away_score' => 1,
            'round' => 'Matchday 1',
            'created_by' => $admin->id,
        ]);

        // 7. Calculate Initial Standings
        foreach ($teams as $idx => $team) {
            Standing::create([
                'competition_id' => $comp->id,
                'team_id' => $team->id,
                'played' => rand(2, 4),
                'win' => rand(1, 3),
                'draw' => rand(0, 1),
                'lose' => rand(0, 1),
                'goals_for' => rand(6, 14),
                'goals_against' => rand(4, 9),
                'goal_difference' => rand(2, 7),
                'points' => (3 * rand(1, 3)) + rand(0, 1),
                'rank' => $idx + 1,
            ]);

            Standing::create([
                'competition_id' => $comp2->id,
                'team_id' => $team->id,
                'played' => 1,
                'win' => 0,
                'draw' => 1,
                'lose' => 0,
                'goals_for' => 1,
                'goals_against' => 1,
                'goal_difference' => 0,
                'points' => 1,
                'rank' => $idx + 1,
            ]);
        }

        // 8. Calculate Initial Player Stats
        foreach ($createdPlayers as $pl) {
            PlayerSeasonStat::create([
                'player_id' => $pl->id,
                'competition_id' => $comp->id,
                'goals' => rand(0, 5),
                'assists' => rand(0, 4),
                'yellow_cards' => rand(0, 2),
                'red_cards' => rand(0, 1),
                'matches_played' => rand(2, 4),
                'man_of_the_match_count' => rand(0, 2),
            ]);
        }

        // 9. Initial Event Posts
        \App\Models\Event::create([
            'title' => 'Pembukaan Resmi RS LIVASYA FUTSAL CUP 2026 🏆',
            'content' => 'Turnamen futsal bergengsi RS LIVASYA CUP 2026 resmi dibuka hari ini di Rama Futsall Kadipaten! Mari dukung tim favorit kalian dan jadilah bagian dari euforia futsal terbesar musim ini. Jangan lupa jaga sportifitas dan kebersamaan! 🔥⚽ #RSLivasyaCup2026 #FutsalMajalengka #RamaFutsall',
            'image_url' => 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1000&q=80',
            'author_name' => 'Panitia Turnamen Livasya',
            'likes_count' => 142,
            'comments_count' => 28,
            'shares_count' => 15,
            'is_published' => true,
        ]);

        \App\Models\Event::create([
            'title' => 'Match Highlight: Livasya FC vs Majalengka United ⚽',
            'content' => 'Pertandingan sengit sore tadi berakhir imbang 2-2 antara Livasya FC dan Majalengka United! Gol penyeimbang diciptakan di menit-menit akhir babak kedua. Simak statistik lengkap dan cuplikan pertandingannya di tab Livescore!',
            'image_url' => 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=1000&q=80',
            'author_name' => 'Media Officer Livasya',
            'likes_count' => 98,
            'comments_count' => 14,
            'shares_count' => 7,
            'is_published' => true,
        ]);

        \App\Models\Event::create([
            'title' => 'Syarat & Ketentuan Pendaftaran Sponsor 📝',
            'content' => 'RS LIVASYA FUTSAL CUP 2026 membuka kesempatan bagi brand dan produk yang ingin menjadi sponsor resmi turnamen. Hubungi panitia melalui tombol WhatsApp di menu About untuk informasi media kit dan paket sponsorship menarik!',
            'image_url' => 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1000&q=80',
            'author_name' => 'Humas RS Livasya',
            'likes_count' => 64,
            'comments_count' => 6,
            'shares_count' => 12,
            'is_published' => true,
        ]);
    }
}

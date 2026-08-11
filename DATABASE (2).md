# DATABASE.md — Skema Database
## Aplikasi Web Livescore Futsal "RS LIVASYA"

---

## 1. Entity Relationship Diagram (ERD — Deskriptif)

```
users (admin) ──────< activity_logs

competitions ──< matches >── teams
                    │
                    ├──< match_events >── players
                    ├──< match_statistics
                    └──< match_lineups >── players

teams ──< players
teams ──< standings >── competitions

players ──< player_season_stats >── competitions
```

## 2. Daftar Tabel

### 2.1 `users` — Akun Admin/Operator
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | UUID / BIGINT PK | ID unik |
| name | VARCHAR(100) | Nama admin |
| email | VARCHAR(150) UNIQUE | Email login |
| password_hash | VARCHAR(255) | Password terenkripsi (bcrypt) |
| role | ENUM('super_admin','operator') | Level akses |
| is_active | BOOLEAN | Status aktif akun |
| created_at | TIMESTAMP | Waktu dibuat |
| updated_at | TIMESTAMP | Waktu diperbarui |

### 2.2 `competitions` — Kompetisi/Turnamen
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | UUID/BIGINT PK | ID unik |
| name | VARCHAR(150) | Nama kompetisi (mis. "Liga Futsal RS LIVASYA 2026") |
| season | VARCHAR(50) | Musim (mis. "2026") |
| type | ENUM('league','knockout','group') | Format kompetisi |
| points_win | INT DEFAULT 3 | Poin menang |
| points_draw | INT DEFAULT 1 | Poin seri |
| points_loss | INT DEFAULT 0 | Poin kalah |
| start_date | DATE | Tanggal mulai |
| end_date | DATE | Tanggal selesai |
| is_active | BOOLEAN | Kompetisi berjalan |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### 2.3 `teams` — Tim
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | UUID/BIGINT PK | ID unik |
| name | VARCHAR(100) | Nama tim |
| short_name | VARCHAR(10) | Singkatan (mis. "SWI") |
| logo_url | VARCHAR(255) | URL logo tim |
| coach_name | VARCHAR(100) | Nama pelatih (opsional) |
| founded_year | INT | Tahun berdiri (opsional) |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### 2.4 `players` — Pemain
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | UUID/BIGINT PK | ID unik |
| team_id | FK → teams.id | Tim pemain |
| name | VARCHAR(100) | Nama pemain |
| photo_url | VARCHAR(255) | Foto pemain |
| jersey_number | INT | Nomor punggung |
| position | ENUM('GK','DEF','MID','FWD') | Posisi bermain |
| date_of_birth | DATE | Tanggal lahir (opsional) |
| is_active | BOOLEAN | Status aktif di roster |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### 2.5 `matches` — Pertandingan
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | UUID/BIGINT PK | ID unik |
| competition_id | FK → competitions.id | Kompetisi terkait |
| home_team_id | FK → teams.id | Tim tuan rumah / A |
| away_team_id | FK → teams.id | Tim tamu / B |
| match_date | DATETIME | Tanggal & jam kick-off |
| venue | VARCHAR(150) | Lokasi pertandingan |
| status | ENUM('scheduled','live','half_time','full_time','postponed','cancelled') | Status pertandingan |
| current_minute | INT DEFAULT 0 | Menit berjalan (live clock) |
| home_score | INT DEFAULT 0 | Skor tim A |
| away_score | INT DEFAULT 0 | Skor tim B |
| round | VARCHAR(50) | Grup/babak (mis. "Grup G", "Semifinal") |
| best_player_id | FK → players.id NULLABLE | Man of the Match |
| best_player_rating | DECIMAL(3,1) | Rating best player |
| created_by | FK → users.id | Admin pembuat jadwal |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### 2.6 `match_events` — Kejadian Pertandingan (Realtime Log)
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | UUID/BIGINT PK | ID unik |
| match_id | FK → matches.id | Pertandingan terkait |
| team_id | FK → teams.id | Tim yang terkait event |
| player_id | FK → players.id NULLABLE | Pemain utama terkait event |
| related_player_id | FK → players.id NULLABLE | Pemain terkait sekunder (assist / pemain masuk saat substitusi) |
| event_type | ENUM('goal','yellow_card','red_card','substitution_in','substitution_out','timeout','own_goal') | Jenis kejadian |
| minute | INT | Menit kejadian |
| extra_info | JSON/TEXT | Info tambahan (mis. "Additional time 6 min") |
| created_by | FK → users.id | Admin yang menginput |
| created_at | TIMESTAMP | Waktu input (untuk audit realtime) |

### 2.7 `match_statistics` — Statistik Pertandingan
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | UUID/BIGINT PK | ID unik |
| match_id | FK → matches.id | Pertandingan terkait |
| team_id | FK → teams.id | Tim terkait |
| possession_percent | DECIMAL(5,2) | Penguasaan bola (%) |
| shots_total | INT | Total tembakan |
| shots_on_target | INT | Tembakan tepat sasaran |
| fouls | INT | Jumlah pelanggaran |
| corners | INT | Jumlah tendangan sudut |
| yellow_cards | INT | Total kartu kuning |
| red_cards | INT | Total kartu merah |
| updated_at | TIMESTAMP | |

### 2.8 `match_lineups` — Susunan Pemain per Pertandingan
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | UUID/BIGINT PK | ID unik |
| match_id | FK → matches.id | Pertandingan terkait |
| team_id | FK → teams.id | Tim terkait |
| player_id | FK → players.id | Pemain |
| role | ENUM('starter','substitute') | Peran dalam line-up |
| position_on_field | VARCHAR(20) | Posisi di lapangan (opsional, untuk visual formasi) |

### 2.9 `standings` — Klasemen (Tersimpan/Ter-cache per Kompetisi)
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | UUID/BIGINT PK | ID unik |
| competition_id | FK → competitions.id | Kompetisi terkait |
| team_id | FK → teams.id | Tim terkait |
| played | INT DEFAULT 0 | Jumlah main |
| win | INT DEFAULT 0 | Jumlah menang |
| draw | INT DEFAULT 0 | Jumlah seri |
| lose | INT DEFAULT 0 | Jumlah kalah |
| goals_for | INT DEFAULT 0 | Gol masuk |
| goals_against | INT DEFAULT 0 | Gol kebobolan |
| goal_difference | INT DEFAULT 0 | Selisih gol (computed) |
| points | INT DEFAULT 0 | Total poin |
| rank | INT | Peringkat (computed/cache) |
| updated_at | TIMESTAMP | Waktu terakhir dihitung ulang |

> Catatan: tabel `standings` dapat berupa tabel materialized (di-refresh oleh Auto-Calculation Service) atau view SQL yang dihitung on-the-fly dari `matches` — pendekatan tabel cache direkomendasikan untuk performa halaman publik dengan traffic tinggi.

### 2.10 `player_season_stats` — Statistik Akumulatif Pemain (Leaderboard)
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | UUID/BIGINT PK | ID unik |
| player_id | FK → players.id | Pemain terkait |
| competition_id | FK → competitions.id | Kompetisi/musim terkait |
| goals | INT DEFAULT 0 | Total gol |
| assists | INT DEFAULT 0 | Total assist |
| yellow_cards | INT DEFAULT 0 | Total kartu kuning |
| red_cards | INT DEFAULT 0 | Total kartu merah |
| matches_played | INT DEFAULT 0 | Jumlah pertandingan dimainkan |
| man_of_the_match_count | INT DEFAULT 0 | Jumlah menjadi Best Player |
| updated_at | TIMESTAMP | Waktu terakhir dihitung ulang |

### 2.11 `activity_logs` — Audit Trail Admin
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | UUID/BIGINT PK | ID unik |
| user_id | FK → users.id | Admin yang melakukan aksi |
| action | VARCHAR(100) | Jenis aksi (mis. "create_match_event") |
| entity_type | VARCHAR(50) | Entitas terkait (mis. "match_events") |
| entity_id | UUID/BIGINT | ID entitas terkait |
| detail | JSON | Detail perubahan (before/after) |
| created_at | TIMESTAMP | Waktu aksi |

## 3. Relasi Antar Tabel (Ringkasan)

- `competitions` 1—N `matches`
- `teams` 1—N `players`
- `teams` 1—N `matches` (sebagai home/away)
- `matches` 1—N `match_events`
- `matches` 1—N `match_statistics` (per tim, biasanya 2 baris per match)
- `matches` 1—N `match_lineups`
- `players` 1—N `match_events` (sebagai pelaku event)
- `players` 1—N `player_season_stats`
- `teams` 1—N `standings` (per kompetisi)
- `users` 1—N `activity_logs`

## 4. Indexing Rekomendasi

- `matches`: index pada `(status, match_date)` untuk query "pertandingan live/hari ini" yang sering diakses
- `match_events`: index pada `match_id` untuk load timeline cepat
- `standings`: unique index pada `(competition_id, team_id)`
- `player_season_stats`: unique index pada `(player_id, competition_id)`
- `players`: index pada `team_id`

## 5. Contoh Query Kunci

**Klasemen kompetisi (urut poin, lalu selisih gol):**
```sql
SELECT t.name, s.played, s.win, s.draw, s.lose,
       s.goals_for, s.goals_against, s.goal_difference, s.points
FROM standings s
JOIN teams t ON t.id = s.team_id
WHERE s.competition_id = :competition_id
ORDER BY s.points DESC, s.goal_difference DESC, s.goals_for DESC;
```

**Top Scorer leaderboard:**
```sql
SELECT p.name, t.name AS team_name, ps.goals
FROM player_season_stats ps
JOIN players p ON p.id = ps.player_id
JOIN teams t ON t.id = p.team_id
WHERE ps.competition_id = :competition_id
ORDER BY ps.goals DESC
LIMIT 20;
```

**Pertandingan live saat ini (untuk polling awal sebelum subscribe WebSocket):**
```sql
SELECT * FROM matches
WHERE status IN ('live','half_time')
ORDER BY match_date ASC;
```

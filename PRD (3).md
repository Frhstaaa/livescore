# PRD — Product Requirements Document
## Aplikasi Web Livescore Futsal "RS LIVASYA"

---

## 1. Ringkasan Produk

**RS LIVASYA** adalah aplikasi web livescore untuk kompetisi futsal internal/antar-tim yang menyajikan skor pertandingan secara realtime, statistik pemain, klasemen tim, serta panel admin untuk mengelola seluruh data pertandingan secara langsung (live input) selama pertandingan berlangsung.

Referensi gaya UI: layout card-based mobile-first (mirip "Gemscore"), dengan warna aksen ungu/biru, badge tim, indikator waktu berjalan (live minute), dan tab navigasi bawah (Score, Watch, News, Favorites).

## 2. Latar Belakang & Tujuan

- Kompetisi futsal RS LIVASYA saat ini belum memiliki media digital yang menampilkan skor, statistik, dan klasemen secara realtime kepada penonton/peserta.
- Panitia/admin membutuhkan satu dashboard terpusat untuk mengelola jadwal, mencatat kejadian pertandingan (gol, kartu, pergantian pemain), dan otomatis memperbarui statistik & klasemen.
- Tujuan: menghadirkan pengalaman menonton livescore yang informatif, real-time, dan mudah diakses lewat browser (desktop & mobile).

## 3. Target Pengguna

| Role | Deskripsi |
|---|---|
| **Publik/Penonton (Guest)** | Pengguna umum yang mengakses tanpa login untuk melihat livescore, statistik pemain, dan klasemen. |
| **Admin/Panitia** | Pengelola kompetisi yang login ke dashboard admin untuk mengatur jadwal, tim, pemain, dan input kejadian pertandingan secara realtime. |
| **(Opsional) Operator Pertandingan** | Sub-role admin khusus yang bertugas hanya menginput jalannya pertandingan (live match operator) saat hari-H. |

## 4. Ruang Lingkup (Scope)

### 4.1 In-Scope
- Halaman Beranda/Livescore (daftar pertandingan per tanggal, status Live/Selesai/Akan Datang)
- Halaman Detail Pertandingan (skor, jalannya pertandingan, statistik, line-up, H2H)
- Halaman Pemain (leaderboard statistik pemain: top scorer, top assist, dsb — realtime)
- Halaman Klasemen (ranking tim berdasarkan poin, menang/seri/kalah, selisih gol)
- Dashboard Admin (CRUD tim, pemain, jadwal; live input skor & kejadian pertandingan)
- Sistem realtime update (skor & menit berjalan otomatis ter-update di sisi publik tanpa refresh)
- Autentikasi admin (login, role-based access)

### 4.2 Out of Scope (Fase 1)
- Aplikasi mobile native (iOS/Android)
- Sistem pembelian tiket/streaming video
- Notifikasi push ke perangkat pengguna (bisa jadi fase 2)
- Fitur sosial (komentar, chat live)

## 5. Alur Sistem (High-Level)

1. **Halaman Utama/Livescore** — menampilkan daftar pertandingan futsal antar tim per tanggal (Live, Fulltime, Upcoming), beserta ringkasan skor & statistik singkat.
2. **Halaman Pemain** — menampilkan leaderboard statistik pemain secara realtime (gol, assist, kartu, dll), dikelompokkan sesuai tim masing-masing.
3. **Halaman Klasemen** — menampilkan klasemen/ranking tim berdasarkan perhitungan poin (menang = 3, seri = 1, kalah = 0), lengkap dengan selisih gol dan jumlah pertandingan.
4. **Dashboard Admin** — pusat kendali seluruh data: jadwal pertandingan, menit berjalan pertandingan (live clock), penambahan tim & pemain, input kejadian pertandingan (gol, kartu, substitusi). Semua perubahan di admin langsung terekam & tampil realtime di frontend publik.

## 6. Kebutuhan Fungsional (Functional Requirements)

### 6.1 Modul Publik

**FR-1 Beranda/Livescore**
- FR-1.1 Menampilkan daftar pertandingan berdasarkan tanggal (filter tab: kemarin, hari ini, besok, dst.)
- FR-1.2 Status pertandingan: `Upcoming`, `Live` (dengan menit berjalan), `Half Time`, `Full Time`
- FR-1.3 Menampilkan logo/badge tim, skor, dan waktu kick-off
- FR-1.4 Update skor & menit berjalan secara realtime tanpa reload halaman
- FR-1.5 Pengelompokan pertandingan berdasarkan kompetisi/turnamen

**FR-2 Detail Pertandingan**
- FR-2.1 Tab: Summary, Info, Stats, Line-Up, Head-to-Head (H2H)
- FR-2.2 Timeline kejadian pertandingan (gol, kartu kuning/merah, pergantian pemain) beserta menit kejadian
- FR-2.3 Statistik pertandingan (penguasaan bola, tembakan, pelanggaran, dll — sesuai data yang diinput admin)
- FR-2.4 Best Player / Man of the Match dengan rating
- FR-2.5 Line-up starter & pemain cadangan per tim

**FR-3 Halaman Pemain**
- FR-3.1 Leaderboard Top Scorer, Top Assist, Top Kartu, dll (realtime)
- FR-3.2 Filter/list pemain berdasarkan tim
- FR-3.3 Profil singkat pemain: foto, nomor punggung, posisi, tim, statistik akumulatif musim berjalan

**FR-4 Halaman Klasemen**
- FR-4.1 Tabel klasemen: Peringkat, Tim, Main, Menang, Seri, Kalah, Gol Masuk, Gol Kebobolan, Selisih Gol, Poin
- FR-4.2 Sorting otomatis berdasarkan poin → selisih gol → gol masuk
- FR-4.3 Update otomatis setiap pertandingan berakhir (Full Time)
- FR-4.4 Filter berdasarkan kompetisi/grup (jika ada fase grup)

### 6.2 Modul Admin

**FR-5 Autentikasi & Role**
- FR-5.1 Login admin (email/username + password)
- FR-5.2 Role-based access (Super Admin, Operator Pertandingan — opsional)
- FR-5.3 Session management & logout

**FR-6 Manajemen Tim**
- FR-6.1 Tambah/edit/hapus tim (nama, logo, deskripsi)
- FR-6.2 Assign pemain ke tim

**FR-7 Manajemen Pemain**
- FR-7.1 Tambah/edit/hapus pemain (nama, foto, nomor punggung, posisi, tim)
- FR-7.2 Riwayat statistik pemain per pertandingan & akumulatif

**FR-8 Manajemen Jadwal Pertandingan**
- FR-8.1 Tambah/edit/hapus jadwal (tim A vs tim B, tanggal, jam, venue, kompetisi)
- FR-8.2 Ubah status pertandingan (Scheduled → Live → Half Time → Full Time → Postponed/Cancelled)

**FR-9 Live Match Control (Realtime Input)**
- FR-9.1 Start/pause/stop jam pertandingan (match clock) — menit berjalan otomatis terhitung & tersinkron ke frontend
- FR-9.2 Input kejadian pertandingan secara live: Gol (pencetak gol, menit, assist opsional), Kartu Kuning/Merah, Pergantian Pemain (in/out), Time-out
- FR-9.3 Update skor otomatis ter-kalkulasi dari input gol
- FR-9.4 Input statistik pertandingan (penguasaan bola, tembakan, dll)
- FR-9.5 Set Best Player / Man of the Match beserta rating
- FR-9.6 Setiap perubahan langsung ter-publish ke seluruh halaman publik secara realtime

**FR-10 Otomasi Klasemen & Statistik**
- FR-10.1 Sistem otomatis menghitung ulang klasemen setiap pertandingan berstatus Full Time
- FR-10.2 Sistem otomatis mengakumulasi statistik pemain (leaderboard) dari data kejadian pertandingan

## 7. Kebutuhan Non-Fungsional (Non-Functional Requirements)

| Kategori | Kebutuhan |
|---|---|
| **Realtime** | Update skor & menit berjalan maksimal delay 1–2 detik (via WebSocket/SSE) |
| **Performa** | Halaman publik load < 2 detik pada koneksi 4G |
| **Skalabilitas** | Mendukung banyak pertandingan berjalan bersamaan (multi-match live) |
| **Responsif** | Layout adaptif desktop, tablet, mobile (mobile-first sesuai referensi desain) |
| **Keamanan** | Autentikasi admin terenkripsi (hashing password), proteksi endpoint admin dari akses publik |
| **Ketersediaan** | Uptime tinggi khususnya saat jam pertandingan berlangsung |
| **Audit Trail** | Setiap input admin tercatat (siapa, kapan, apa perubahannya) untuk keperluan koreksi/verifikasi |

## 8. Metrik Keberhasilan (Success Metrics)

- Delay update skor realtime rata-rata < 2 detik
- Admin dapat menyelesaikan input 1 pertandingan penuh (gol, kartu, substitusi) tanpa error
- Klasemen ter-update otomatis 100% akurat setelah pertandingan Full Time
- Jumlah pengunjung aktif per hari pertandingan (page views halaman livescore)

## 9. Asumsi & Batasan

- Data pertandingan diinput manual secara realtime oleh admin/operator yang berada di lokasi pertandingan (tidak ada integrasi sensor/hardware).
- Kompetisi dijalankan dalam sistem grup/liga dengan perhitungan poin standar (Menang 3, Seri 1, Kalah 0) — dapat disesuaikan.
- Fase 1 fokus pada web app; tidak ada aplikasi native.

## 10. Roadmap Singkat

| Fase | Fokus |
|---|---|
| Fase 1 (MVP) | Halaman Livescore, Pemain, Klasemen (publik) + Dashboard Admin dasar (CRUD tim/pemain/jadwal + live input skor) |
| Fase 2 | Statistik pertandingan lanjutan, Best Player rating, H2H, Line-up formasi visual |
| Fase 3 | Notifikasi realtime (push/browser), multi-kompetisi, export laporan |

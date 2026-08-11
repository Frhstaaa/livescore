# USERFLOW.md — Alur Pengguna (User Flow)
## Aplikasi Web Livescore Futsal "RS LIVASYA"

---

## 1. Peta Alur Umum

```
┌───────────────────────┐        ┌───────────────────────┐
│   PENGGUNA PUBLIK       │        │        ADMIN            │
│  (tanpa login)           │        │  (login diperlukan)     │
└───────────┬─────────────┘        └───────────┬─────────────┘
            │                                    │
            ▼                                    ▼
   Halaman Utama/Livescore              Login → Dashboard Admin
            │                                    │
   ┌────────┼────────┐                 ┌─────────┼──────────┐
   ▼        ▼        ▼                 ▼         ▼          ▼
 Detail  Halaman   Halaman         Kelola     Kelola     Live Match
 Match   Pemain   Klasemen          Tim/       Jadwal      Control
                                    Pemain                 (Realtime)
                                                               │
                                                               ▼
                                                  Data ter-broadcast realtime
                                                   ke semua halaman publik
```

## 2. Alur Pengguna Publik

### 2.1 Flow: Melihat Livescore

1. Pengguna membuka aplikasi web → mendarat di **Halaman Utama/Livescore**
2. Sistem menampilkan daftar pertandingan hari ini secara default (tab tanggal "Today" aktif)
3. Pengguna dapat:
   - Memilih tab kompetisi (Futsal Liga A, Turnamen X, dst.)
   - Menggeser tanggal (kemarin/besok) untuk melihat jadwal lain
   - Melihat status tiap pertandingan: `Upcoming` (jam kick-off), `Live` (skor + menit berjalan, update otomatis), `Full Time` (skor akhir)
4. Pengguna tap salah satu **Match Card** → masuk ke **Halaman Detail Pertandingan**

### 2.2 Flow: Detail Pertandingan

1. Sistem menampilkan header skor besar (badge tim, skor, status)
2. Pengguna dapat berpindah tab:
   - **Summary** → ringkasan pencetak gol, timeline kejadian utama
   - **Info** → info kompetisi, venue, wasit (jika ada)
   - **Stats** → statistik pertandingan (penguasaan bola, tembakan, dll)
   - **Line-Ups** → susunan pemain starter & cadangan kedua tim
   - **H2H** → riwayat pertemuan kedua tim sebelumnya
3. Jika status pertandingan `Live`, seluruh data pada halaman ini (skor, menit, timeline) **update otomatis secara realtime** tanpa perlu refresh manual
4. Pengguna dapat tap ikon lonceng untuk mengaktifkan notifikasi pertandingan (opsional fase lanjutan)
5. Pengguna dapat tap nama pemain pada timeline/line-up → menuju **Profil Pemain**

### 2.3 Flow: Halaman Pemain (Statistik & Leaderboard)

1. Pengguna membuka menu **Pemain** dari bottom navigation
2. Sistem menampilkan leaderboard default (mis. Top Scorer) — data realtime mengikuti pertandingan yang sedang berjalan
3. Pengguna dapat:
   - Mengganti kategori statistik (Gol, Assist, Kartu Kuning/Merah)
   - Memfilter berdasarkan tim tertentu
4. Pengguna tap salah satu pemain → menuju **Profil Pemain** (foto, nomor punggung, posisi, tim, statistik akumulatif musim berjalan)

### 2.4 Flow: Halaman Klasemen

1. Pengguna membuka menu **Klasemen** dari bottom navigation
2. Sistem menampilkan tabel klasemen kompetisi aktif, terurut berdasarkan poin → selisih gol → gol masuk
3. Pengguna dapat memfilter kompetisi/grup jika tersedia lebih dari satu
4. Klasemen otomatis ter-update setiap ada pertandingan yang selesai (status Full Time)
5. Pengguna tap nama tim → menuju **Profil Tim** (daftar pemain, hasil pertandingan sebelumnya, posisi klasemen)

## 3. Alur Admin

### 3.1 Flow: Login Admin

1. Admin membuka URL `/admin/login`
2. Admin memasukkan email & password
3. Sistem memvalidasi kredensial
   - Jika gagal → tampilkan pesan error, admin dapat mencoba kembali
   - Jika berhasil → redirect ke **Dashboard Admin**

### 3.2 Flow: Manajemen Tim & Pemain

1. Admin membuka menu **Tim** di sidebar
2. Admin dapat:
   - Tambah tim baru (nama, logo, pelatih)
   - Edit/hapus tim yang sudah ada
3. Admin membuka menu **Pemain**
4. Admin dapat:
   - Tambah pemain baru (nama, foto, nomor punggung, posisi) dan assign ke tim
   - Edit/hapus data pemain
5. Perubahan tersimpan ke database dan langsung tersedia untuk dipilih saat penjadwalan/line-up pertandingan

### 3.3 Flow: Manajemen Jadwal Pertandingan

1. Admin membuka menu **Jadwal**
2. Admin klik **Tambah Pertandingan**
3. Admin mengisi: kompetisi, tim A, tim B, tanggal & jam, venue, babak/grup
4. Sistem menyimpan jadwal dengan status default `Scheduled`
5. Jadwal otomatis muncul di Halaman Utama/Livescore publik pada tab tanggal terkait (status `Upcoming`)
6. Admin dapat mengedit atau membatalkan (`Postponed`/`Cancelled`) jadwal sewaktu-waktu sebelum pertandingan dimulai

### 3.4 Flow: Live Match Control (Inti Realtime)

1. Pada hari pertandingan, admin/operator membuka menu **Live Match Control** dan memilih pertandingan yang akan dimulai
2. Admin melengkapi **line-up** (starter & cadangan) untuk kedua tim sebelum kick-off
3. Admin klik **Start Match** → status pertandingan berubah menjadi `Live`, match clock mulai berjalan (menit 00 → naik otomatis)
   - Perubahan status ini langsung ter-broadcast realtime ke Halaman Utama/Livescore publik
4. Selama pertandingan berlangsung, admin melakukan input kejadian secara live melalui Quick Action:
   - **Gol** → pilih tim, pilih pemain pencetak, (opsional) pemain assist → sistem otomatis menambah skor & mencatat menit dari clock berjalan
   - **Kartu Kuning/Merah** → pilih tim & pemain
   - **Substitusi** → pilih pemain keluar & pemain masuk
   - **Time-out** (jika berlaku pada aturan futsal)
5. Setiap input tersimpan ke `match_events` dan **langsung ter-broadcast** ke:
   - Halaman Detail Pertandingan publik (timeline & skor update instan)
   - Halaman Utama/Livescore (skor pada match card update instan)
6. Admin dapat **Pause** clock (mis. saat half-time) → status berubah `Half Time`
7. Admin klik **Resume** untuk melanjutkan babak kedua
8. Setelah waktu pertandingan selesai, admin klik **Full Time**:
   - Status pertandingan menjadi `Full Time`
   - Sistem otomatis men-trigger **Auto-Calculation Service**:
     - Klasemen (`standings`) dihitung ulang untuk kedua tim
     - Statistik pemain (`player_season_stats`) diakumulasi dari kejadian pertandingan
   - Perubahan klasemen & leaderboard langsung terlihat di halaman publik tanpa aksi tambahan dari admin
9. (Opsional) Admin menetapkan **Best Player / Man of the Match** beserta rating sebelum menutup sesi input

### 3.5 Flow: Koreksi Data Pasca-Pertandingan

1. Jika terjadi kesalahan input (mis. salah pemain pencetak gol), admin membuka riwayat pertandingan yang sudah Full Time
2. Admin mengedit/menghapus entry `match_events` yang salah
3. Sistem otomatis menghitung ulang skor, statistik pemain, dan klasemen terkait
4. Perubahan tercatat di `activity_logs` untuk keperluan audit

## 4. Diagram Alur Realtime (Perspektif Pengguna)

```
Admin input "Gol" pada Live Match Control
            │
            ▼
   Skor & timeline tersimpan di server
            │
            ▼
   Server broadcast via WebSocket
            │
   ┌────────┴─────────┐
   ▼                   ▼
Halaman Livescore   Halaman Detail Pertandingan
(skor di match card  (skor header + timeline
 langsung berubah)    langsung bertambah entry)
```

## 5. Skenario Edge Case

| Skenario | Penanganan |
|---|---|
| Koneksi realtime pengguna publik terputus | Tampilkan banner "Koneksi terputus, mencoba menyambung ulang…", fallback polling berkala hingga WS tersambung kembali |
| Admin salah input gol saat live | Sediakan fitur "Undo" cepat pada 5 detik terakhir + halaman koreksi manual pasca-match |
| Dua admin/operator mengelola pertandingan yang sama bersamaan | Kunci sesi (lock) per pertandingan — hanya satu operator aktif dapat menginput dalam satu waktu, admin lain masuk mode "view only" |
| Pertandingan ditunda/dibatalkan | Admin ubah status ke `Postponed`/`Cancelled`, otomatis tidak dihitung ke klasemen, badge status khusus tampil di publik |
| Jaringan admin di lokasi pertandingan tidak stabil | Sistem antre (queue) input di sisi client dan kirim ulang otomatis saat koneksi pulih, guna mencegah data hilang |

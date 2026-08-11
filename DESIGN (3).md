# DESIGN.md — Panduan Desain UI/UX
## Aplikasi Web Livescore Futsal "RS LIVASYA"

---

## 1. Prinsip Desain

Merujuk pada referensi desain (gaya "Gemscore"): card-based, bersih, informasi padat namun mudah dipindai (scannable), dengan aksen warna cerah untuk status "Live".

- **Clarity first** — skor & status pertandingan harus terbaca dalam < 2 detik pandangan mata
- **Realtime feel** — indikator live (menit berjalan, dot berdenyut/pulse, badge merah/oranye) untuk pertandingan yang sedang berlangsung
- **Konsisten** — badge tim, avatar pemain, dan tipografi angka skor konsisten di semua halaman
- **Mobile-first, scalable ke desktop** — layout dasar dirancang untuk lebar ~375–430px, kemudian di-scale ke grid multi-kolom di desktop

## 2. Identitas Visual

### 2.1 Palet Warna

| Token | Hex (contoh) | Penggunaan |
|---|---|---|
| `--color-primary` | `#5B5FEF` (ungu-biru) | Tombol utama, tab aktif, aksen brand |
| `--color-primary-soft` | `#EEF0FF` | Background chip/badge tab aktif |
| `--color-live` | `#FF5B5B` | Status "Live", indikator menit berjalan, notifikasi |
| `--color-success` | `#22C55E` | Status menang, indikator positif |
| `--color-warning` | `#F59E0B` | Kartu kuning, peringatan |
| `--color-danger` | `#EF4444` | Kartu merah, hapus/error |
| `--color-bg` | `#F5F6FA` | Background utama aplikasi |
| `--color-surface` | `#FFFFFF` | Background card |
| `--color-text-primary` | `#111827` | Judul, skor, teks utama |
| `--color-text-secondary` | `#6B7280` | Sub-teks, timestamp, label |
| `--color-border` | `#E5E7EB` | Garis pembatas card/list |

### 2.2 Tipografi

- **Font family**: Sans-serif modern (mis. `Inter`, `Poppins`, atau `SF Pro`)
- **Skala**:
  - Judul halaman (H1): 20–24px, semi-bold
  - Judul card/tim: 14–16px, medium/semi-bold
  - Skor pertandingan: 22–28px, bold (angka harus paling menonjol di card)
  - Body/label: 12–13px, regular
  - Caption/timestamp: 11px, regular, warna secondary

### 2.3 Ikonografi & Aset
- Badge/logo tim: bentuk lingkaran atau rounded-square, ukuran konsisten (32px list, 48–64px detail)
- Ikon: line-icon set konsisten (search, bell/notifikasi, menu, chevron, star untuk favorite)
- Foto pemain: bulat (avatar), fallback inisial jika tidak ada foto

## 3. Komponen UI Utama

### 3.1 Match Card (Kartu Pertandingan)
Digunakan di Beranda/Livescore. Berisi:
- Baris tim A (badge + nama) dan tim B (badge + nama), skor di kanan
- Status: `Upcoming` (jam kick-off), `Live` (menit berjalan + dot merah berdenyut), `FT` (Full Time)
- Ikon lonceng (subscribe notifikasi) untuk pertandingan live/upcoming
- Tap → membuka Halaman Detail Pertandingan

### 3.2 Tab Kompetisi/Kategori
- Pill/chip horizontal scroll (mis. "Futsal Liga A", "Turnamen X") — tab aktif berwarna primary solid, non-aktif outline/soft

### 3.3 Date Selector
- Baris tanggal horizontal (Tue 22 Nov, Wed 23 Nov, **Today** highlight, dst.) — tab "Today" default aktif dengan warna primary

### 3.4 Live Match Detail Header
- Nama kompetisi + grup/fase
- Badge tim besar kiri-kanan, skor besar di tengah, status FT/Live/menit
- Baris pencetak gol (ikon bola + nama + menit)

### 3.5 Tab Navigasi Detail (Summary / Info / Stats / Line-Ups / H2H)
- Underline tab, warna primary untuk tab aktif

### 3.6 Timeline Kejadian Pertandingan
- List kronologis: ikon substitusi (in/out hijau-merah), ikon kartu kuning/merah, ikon gol
- Menit di kiri, deskripsi kejadian di kanan

### 3.7 Leaderboard Card (Halaman Pemain)
- List peringkat dengan foto pemain, nama, tim, dan nilai statistik (gol/assist) di kanan
- Ranking 1–3 bisa diberi aksen (medali/warna emas-perak-perunggu) opsional

### 3.8 Tabel Klasemen
- Header sticky: `#`, `Tim`, `M` (Main), `M` (Menang), `S`, `K`, `SG`, `Poin`
- Baris zona promosi/degradasi (jika ada) diberi garis warna kiri (hijau/merah)
- Baris tim mobile: dipadatkan jadi 2 baris info (nama tim + statistik ringkas)

### 3.9 Bottom Navigation (Mobile)
4 menu: **Score** (livescore), **Watch**/Pemain, **News**, **Favorites**/Klasemen — ikon + label, aktif berwarna primary (disesuaikan penamaan ulang: Score, Pemain, Klasemen, Favorit)

### 3.10 Dashboard Admin — Komponen Khusus
- **Sidebar navigasi**: Dashboard, Jadwal, Tim, Pemain, Live Match Control, Pengaturan
- **Match Control Panel**: tombol besar Start/Pause Clock, tampilan menit berjalan real-time, tombol cepat "+1 Gol Tim A", "+1 Gol Tim B", "Kartu Kuning", "Kartu Merah", "Substitusi"
- **Form input**: dropdown pemain, input menit otomatis terisi dari clock berjalan, tombol simpan dengan konfirmasi
- **Tabel data**: CRUD tim/pemain/jadwal dengan aksi edit/hapus per baris, search & filter

## 4. Layout per Halaman

### 4.1 Halaman Utama/Livescore (Publik)
```
[Header: Logo RS LIVASYA | Search | Menu]
[Tab Kompetisi: Futsal Liga A | Liga B | ...]
[Date Selector: Tue | Wed | Today | Fri | Sat]
[Section: Nama Kompetisi >]
  [Match Card] [Match Card] [Match Card] ...
[Bottom Nav: Score | Pemain | Klasemen | Favorit]
```

### 4.2 Halaman Detail Pertandingan
```
[Header: < Back | Nama Kompetisi/Grup | ⋮]
[Score Header: Badge A  Skor  Badge B | Status]
[Pencetak gol]
[Tabs: Summary | Info | Stats | Line-Ups | H2H]
[Best Player Card]
[Timeline kejadian pertandingan]
```

### 4.3 Halaman Pemain
```
[Header: Pemain & Statistik]
[Filter: Semua Tim ▾ | Kategori: Gol/Assist/Kartu ▾]
[Leaderboard List: Rank | Foto | Nama - Tim | Nilai]
```

### 4.4 Halaman Klasemen
```
[Header: Klasemen]
[Filter Kompetisi/Grup ▾]
[Tabel Klasemen: # | Tim | M | Mn | S | K | SG | Poin]
[Keterangan zona (jika ada)]
```

### 4.5 Dashboard Admin
```
[Sidebar: Dashboard | Jadwal | Tim | Pemain | Live Match | Pengaturan]
[Topbar: Nama Admin | Notifikasi | Logout]
[Konten sesuai menu aktif]

--- Halaman Live Match Control ---
[Info Pertandingan: Tim A vs Tim B | Kompetisi]
[Match Clock: 00:00 [Start] [Pause] [Full Time]]
[Skor Live: Tim A [+Gol]   Tim B [+Gol]]
[Quick Actions: Kartu Kuning | Kartu Merah | Substitusi | Time-out]
[Timeline kejadian (live, ter-update otomatis)]
```

## 5. State & Interaksi Penting

- **Live indicator**: dot merah berdenyut (pulse animation) + menit berjalan auto-increment tanpa reload
- **Loading state**: skeleton card saat data awal dimuat
- **Empty state**: ilustrasi + teks "Belum ada pertandingan hari ini" dsb.
- **Error state**: toast/banner jika koneksi realtime terputus, dengan tombol "Coba lagi"
- **Admin confirmation**: dialog konfirmasi sebelum submit gol/kartu (mencegah salah input saat live) — namun tetap ringkas (1 tap) agar tidak menghambat kecepatan input

## 6. Aksesibilitas
- Kontras warna teks minimal rasio 4.5:1 terhadap background
- Ukuran target tap minimal 44x44px pada elemen interaktif (khusus quick action admin saat live match)
- Label ikon disertai teks/aria-label untuk pembaca layar

## 7. Responsive Breakpoints

| Breakpoint | Lebar | Perubahan Layout |
|---|---|---|
| Mobile | < 640px | 1 kolom, bottom nav, date selector scroll horizontal |
| Tablet | 640–1024px | 2 kolom card, sidebar admin collapsible |
| Desktop | > 1024px | 3 kolom (list pertandingan, detail, sidebar statistik), sidebar admin permanen |

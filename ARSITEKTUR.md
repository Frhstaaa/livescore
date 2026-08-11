# ARSITEKTUR.md — Arsitektur Sistem
## Aplikasi Web Livescore Futsal "RS LIVASYA"

---

## 1. Gambaran Umum

Sistem terdiri dari 3 lapisan utama: **Frontend Publik**, **Dashboard Admin**, dan **Backend/API + Realtime Engine**, dengan **Database** sebagai sumber kebenaran tunggal (single source of truth). Perubahan yang dilakukan admin (skor, kejadian pertandingan, menit berjalan) dipublikasikan secara realtime ke seluruh client publik melalui WebSocket.

## 2. Diagram Arsitektur (High-Level)

```
                    ┌─────────────────────────────┐
                    │        PENGGUNA PUBLIK       │
                    │  (Browser Desktop / Mobile)  │
                    └───────────────┬───────────────┘
                                    │ HTTPS + WebSocket
                                    ▼
                    ┌─────────────────────────────┐
                    │      FRONTEND (Web App)      │
                    │  - Halaman Livescore          │
                    │  - Halaman Pemain              │
                    │  - Halaman Klasemen            │
                    │  - Detail Pertandingan         │
                    └───────────────┬───────────────┘
                                    │ REST API (read) + WS Subscribe
                                    ▼
        ┌───────────────────────────────────────────────────┐
        │                    BACKEND SERVER                  │
        │  ┌───────────────┐   ┌───────────────────────────┐│
        │  │   REST API     │   │   Realtime Engine (WS/SSE) ││
        │  │ - Auth         │   │ - Broadcast skor            ││
        │  │ - CRUD Tim     │   │ - Broadcast menit berjalan  ││
        │  │ - CRUD Pemain  │   │ - Broadcast kejadian match  ││
        │  │ - CRUD Jadwal  │   └───────────────────────────┘│
        │  │ - Match Events │                                 │
        │  │ - Statistik    │                                 │
        │  │ - Klasemen     │                                 │
        │  └───────┬────────┘                                 │
        │          │        ┌────────────────────────────┐    │
        │          │        │  Job/Service: Auto-Calc     │    │
        │          │        │  - Update klasemen          │    │
        │          │        │  - Update statistik pemain  │    │
        │          │        └────────────────────────────┘    │
        └──────────┼──────────────────────────────────────────┘
                    │
                    ▼
          ┌───────────────────┐
          │      DATABASE       │
          │  (PostgreSQL/MySQL)  │
          └───────────────────┘
                    ▲
                    │ REST API (write) + Auth
                    │
        ┌───────────┴───────────────┐
        │      DASHBOARD ADMIN        │
        │  - Login                     │
        │  - Manajemen Tim/Pemain      │
        │  - Manajemen Jadwal          │
        │  - Live Match Control Panel  │
        │    (start clock, input gol,  │
        │     kartu, substitusi)       │
        └───────────────────────────┘
```

## 3. Komponen Sistem

### 3.1 Frontend Publik (Client)
- **Teknologi rekomendasi**: React / Next.js (SSR untuk SEO halaman livescore) atau Vue/Nuxt
- **State management**: React Query / SWR untuk data fetching + cache, ditambah client WebSocket subscriber untuk update realtime
- **Styling**: Tailwind CSS (sesuai referensi desain card-based)
- **Fungsi**: render halaman Livescore, Pemain, Klasemen, Detail Pertandingan; subscribe channel realtime per pertandingan yang sedang dibuka/live

### 3.2 Dashboard Admin (Client)
- **Teknologi rekomendasi**: React/Next.js (SPA terpisah atau route ter-proteksi `/admin`)
- **Autentikasi**: JWT/session-based, role-based access control (RBAC)
- **Fungsi khusus**: Live Match Control Panel dengan koneksi WebSocket dua arah (publish event ke server saat admin input, sekaligus menerima konfirmasi state)

### 3.3 Backend / API Server
- **Teknologi rekomendasi**: Node.js (NestJS/Express) atau Laravel/Django — REST API untuk operasi CRUD dan query data
- **Modul utama**:
  - `Auth Service` — login admin, JWT issuing, refresh token
  - `Team Service` — CRUD tim
  - `Player Service` — CRUD pemain, relasi ke tim
  - `Match Service` — CRUD jadwal, ubah status pertandingan
  - `Match Event Service` — input gol/kartu/substitusi/statistik
  - `Standing Service` — kalkulasi & penyajian klasemen
  - `Leaderboard Service` — agregasi statistik pemain realtime

### 3.4 Realtime Engine
- **Teknologi rekomendasi**: WebSocket (Socket.IO / native WS) atau Server-Sent Events (SSE) sebagai fallback
- **Pola**: Pub/Sub per "room" (mis. `match:{match_id}`, `global:livescore`, `global:standings`)
- **Alur**: Admin input event → API menyimpan ke DB → API mem-publish event ke broker realtime → seluruh client yang subscribe room terkait menerima update instan
- **Broker (opsional untuk skala besar)**: Redis Pub/Sub sebagai perantara antara instance backend dan koneksi WebSocket agar horizontal-scalable

### 3.5 Auto-Calculation Service (Background Job)
- Trigger otomatis saat status pertandingan berubah menjadi `Full Time`:
  - Hitung ulang poin klasemen (menang/seri/kalah, gol masuk/kebobolan, selisih gol)
  - Akumulasi statistik pemain ke tabel leaderboard/summary
- Dapat berjalan sebagai event listener (event-driven) atau scheduled job ringan

### 3.6 Database
- **Rekomendasi**: PostgreSQL (relasional, mendukung integritas data pertandingan yang kompleks)
- **Cache layer (opsional)**: Redis — cache klasemen & leaderboard agar query publik cepat, di-invalidate setiap ada update

### 3.7 Media Storage
- Penyimpanan logo tim & foto pemain: object storage (mis. S3-compatible / Cloudinary) dengan URL disimpan di database

## 4. Alur Data Realtime (Sequence)

```
Admin (Live Match Control)
   │  1. Klik "Gol Tim A" untuk pemain X, menit 23
   ▼
API Backend (Match Event Service)
   │  2. Validasi & simpan ke tabel match_events + update skor match
   ▼
Database
   │  3. Commit data
   ▼
API Backend
   │  4. Publish event ke Realtime Engine (room: match:{id} & global:livescore)
   ▼
Realtime Engine (WebSocket)
   │  5. Broadcast payload event ke seluruh client subscriber
   ▼
Frontend Publik (semua browser yang membuka halaman terkait)
   │  6. Update UI otomatis: skor bertambah, timeline muncul entry baru
```

## 5. Keamanan

- Seluruh endpoint admin (`/api/admin/**`) diproteksi middleware autentikasi + otorisasi role
- Rate limiting pada endpoint publik untuk mencegah abuse
- Validasi input server-side (mis. menit tidak boleh > durasi pertandingan, pemain harus terdaftar di tim yang bertanding)
- HTTPS wajib di seluruh komunikasi, termasuk koneksi WebSocket (WSS)
- Audit log tabel `activity_logs` mencatat setiap perubahan data oleh admin (siapa, kapan, aksi apa)

## 6. Skalabilitas & Deployment

- **Containerization**: Docker untuk frontend, backend, dan database agar mudah di-deploy
- **Horizontal scaling backend**: dapat menjalankan multiple instance API di belakang load balancer; Redis Pub/Sub menjaga sinkronisasi event WebSocket antar instance
- **CDN**: aset statis (logo, foto) disajikan via CDN untuk performa
- **CI/CD**: pipeline otomatis (build → test → deploy) untuk frontend & backend secara terpisah
- **Environment**: Staging (untuk uji coba sebelum hari pertandingan) & Production

## 7. Pilihan Teknologi (Rangkuman Rekomendasi)

| Layer | Teknologi |
|---|---|
| Frontend Publik & Admin | React / Next.js + Tailwind CSS |
| Realtime | Socket.IO (WebSocket) + Redis Pub/Sub |
| Backend API | Node.js (NestJS) atau Laravel |
| Database | PostgreSQL |
| Cache | Redis |
| Media Storage | S3-compatible / Cloudinary |
| Autentikasi | JWT + bcrypt hashing |
| Deployment | Docker + CI/CD (GitHub Actions) |

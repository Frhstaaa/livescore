# 🚀 Panduan Lengkap Deploy RS Livasya Livescore di CyberPanel (OpenLiteSpeed)

Panduan ini memandu Anda langkah demi langkah untuk melakukan deploy aplikasi **RS Livasya Livescore** ke VPS/Server yang menggunakan **CyberPanel**.

---

## 📋 Prasyarat Server CyberPanel:
1. **PHP**: Versi **8.2** atau **8.3** (disarankan PHP 8.2+).
2. **Ekstensi PHP Aktif**: `php-curl`, `php-gd`, `php-mbstring`, `php-xml`, `php-zip`, `php-sqlite3` (atau `php-mysql`), `php-bcmath`, `php-intl`.
3. **Database**: MySQL / MariaDB (atau SQLite jika ingin tanpa database terpisah).
4. **Composer**: Terinstall di server.

---

## 🛠️ Langkah 1: Buat Website di CyberPanel
1. Login ke Dashboard **CyberPanel** Anda (`https://IP_SERVER:8090`).
2. Masuk ke menu **Websites** > **Create Website**.
3. Isi form pendaftaran website:
   - **Select Package**: `Default`
   - **Select Owner**: `admin`
   - **Domain Name**: Masukkan domain Anda (misal: `livescore.rslivasya.com` atau `domainanda.com`).
   - **Email**: Email admin Anda.
   - **Select PHP**: Pilih **`PHP 8.2`** atau **`PHP 8.3`**.
   - Centang opsi: **`SSL`**, **`DKIM Support`**, dan **`open_basedir Protection`**.
4. Klik **Create Website**.

---

## 🗄️ Langkah 2: Buat Database MySQL (Jika Menggunakan MySQL)
1. Di CyberPanel, masuk ke menu **Databases** > **Create Database**.
2. Pilih nama website yang baru Anda buat.
3. Buat database baru (misal: `livescore_db`).
4. Buat username & password database yang kuat. Catat kredensial ini untuk konfigurasi file `.env`.

---

## 📂 Langkah 3: Upload / Clone Source Code ke Server
Anda dapat menggunakan **Git Clone** melalui Terminal / SSH (Paling Mudah):

1. Buka **Terminal / SSH** ke server VPS Anda.
2. Masuk ke direktori website:
   ```bash
   cd /home/domainanda.com/public_html
   ```
3. Hapus file `index.html` default bawaan CyberPanel:
   ```bash
   rm -f index.html
   ```
4. Clone repositori dari GitHub:
   ```bash
   git clone https://github.com/Frhstaaa/livescore.git .
   ```

*(Atau jika menggunakan File Manager CyberPanel, upload zip project ini lalu Extract di dalam `/home/domainanda.com/public_html/`)*.

---

## 🌐 Langkah 4: Atur Document Root (vHost Conf) ke Folder `public`
Laravel membutuhkan direktori utama web mengarah ke folder **`public`**:

1. Di CyberPanel, masuk ke **Websites** > **List Websites**.
2. Klik **Manage** pada website Anda.
3. Klik tombol **vHost Conf** (Virtual Host Configurations).
4. Cari baris `docRoot` dan ubah menjadi berakhiran `/public`:
   ```apache
   docRoot                   $VH_ROOT/public_html/public
   ```
5. Simpan (**Save**) konfigurasi vHost.

---

## ⚙️ Langkah 5: Konfigurasi File `.env`
1. Salin `.env.example` menjadi `.env`:
   ```bash
   cp .env.example .env
   ```
2. Buka file `.env` (bisa lewat nano / File Manager CyberPanel):
   ```bash
   nano .env
   ```
3. Sesuaikan baris berikut:
   ```dotenv
   APP_NAME="RS Livasya Livescore"
   APP_ENV=production
   APP_DEBUG=false
   APP_URL=https://domainanda.com

   # Konfigurasi Database (Sesuaikan dengan Database CyberPanel)
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=nama_database_anda
   DB_USERNAME=user_database_anda
   DB_PASSWORD=password_database_anda
   ```
4. Simpan perubahan (`Ctrl + O`, `Enter`, `Ctrl + X`).

---

## ⚡ Langkah 6: Jalankan Script Deployment Otomatis
Jalankan script otomatis yang telah disiapkan di root project:

```bash
chmod +x deploy-cyberpanel.sh
./deploy-cyberpanel.sh
```

Script ini akan secara otomatis:
- Men-generate `APP_KEY`.
- Menginstall dependency Composer production (`--no-dev --optimize-autoloader`).
- Membuat `storage:link` agar upload gambar/foto event & sponsor muncul.
- Menjalankan migrasi tabel database (`php artisan migrate --force`).
- Mengoptimalkan cache sistem (`config`, `route`, `view`).
- Mengatur hak akses folder permissions `storage`, `uploads`, dan `bootstrap/cache`.

---

## 🌱 Langkah 7: (Opsional) Seed Data Awal Admin & Tim
Jika Anda ingin mengisi akun Admin bawaan, Turnamen, 4 Tim resmi, 24 Pemain, dan Sponsor awal:
```bash
php artisan db:seed --force
```

**Kredensial Default Login Admin:**
- **URL Admin**: `https://domainanda.com/admin/login`
- **Email**: `admin@livasya.com`
- **Password**: `password`
*(Harap ganti password setelah login pertama kali di menu admin!)*

---

## 🔄 Langkah 8: Restart OpenLiteSpeed & Fix Permissions
1. Di CyberPanel, klik **Manage** pada website > klik tombol **Fix Permissions**.
2. Masuk ke **Server Status** > **LiteSpeed Status** > Klik **Reboot LiteSpeed** (atau lewat SSH: `systemctl restart lsws`).
3. Kunjungi website Anda di browser: **`https://domainanda.com`**! 🎉

---

## 💡 Troubleshooting:
- **Halaman 404 pada route tertentu**: Pastikan file `public/.htaccess` sudah ada dan mod_rewrite OpenLiteSpeed aktif.
- **Gambar upload tidak muncul**: Jalankan perintah `php artisan storage:link` dan pastikan folder `public/uploads` memiliki izin `chmod -R 775 public/uploads`.
- **Error 500**: Periksa log error di `/home/domainanda.com/public_html/storage/logs/laravel.log` atau pastikan `chmod -R 775 storage bootstrap/cache` sudah dijalankan.

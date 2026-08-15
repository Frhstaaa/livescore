#!/bin/bash
# ==============================================================================
# CyberPanel / OpenLiteSpeed Deployment Script for RS Livasya Livescore
# ==============================================================================

set -e

echo "=================================================="
echo "🚀 MEMULAI DEPLOYMENT LIVESCORE DI CYBERPANEL"
echo "=================================================="

# 1. Cek file .env
if [ ! -f .env ]; then
    echo "📋 Membuat file .env dari .env.example..."
    cp .env.example .env
    php artisan key:generate --force
fi

# 2. Install Composer dependencies
echo "📦 Menginstall dependencies composer (Production Mode)..."
composer install --no-dev --prefer-dist --optimize-autoloader --no-interaction

# 3. Hubungkan Storage Link
echo "🔗 Membuat storage link..."
php artisan storage:link || true

# 4. Migrasi Database
echo "🗄️ Menjalankan migrasi database..."
php artisan migrate --force

# 5. Optimasi Cache Laravel
echo "⚡ Mengoptimalkan cache konfigurasi, route, dan views..."
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache

# 6. Set Hak Akses Folder (Permissions)
echo "🔒 Mengatur hak akses folder storage, uploads & cache..."
chmod -R 775 storage bootstrap/cache
chmod -R 775 public/uploads public/storage || true

echo "=================================================="
echo "✅ DEPLOYMENT BERHASIL!"
echo "🌐 Website RS Livasya Livescore siap digunakan."
echo "=================================================="

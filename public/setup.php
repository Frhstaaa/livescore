<?php
/**
 * RS LIVASYA LIVESCORE - WEB INSTALLER & DEPLOYMENT RUNNER (TANPA TERMINAL / SSH)
 * Akses file ini melalui browser: https://domainanda.com/setup.php
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);
set_time_limit(300);

$baseDir = __DIR__ . '/..';
if (!file_exists($baseDir . '/artisan')) {
    $baseDir = __DIR__;
}

$action = $_GET['action'] ?? null;
$logs = [];
$status = 'idle';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? 'install';

    // Bootstrap Laravel
    try {
        require_once $baseDir . '/vendor/autoload.php';
        $app = require_once $baseDir . '/bootstrap/app.php';
        $kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
        $kernel->bootstrap();

        // 1. Generate APP_KEY if empty
        if (empty(env('APP_KEY'))) {
            \Illuminate\Support\Facades\Artisan::call('key:generate', ['--force' => true]);
            $logs[] = '🔑 APP_KEY baru berhasil dibuat: ' . trim(\Illuminate\Support\Facades\Artisan::output());
        }

        // 2. Storage Link
        try {
            \Illuminate\Support\Facades\Artisan::call('storage:link');
            $logs[] = '🔗 Storage Link: ' . trim(\Illuminate\Support\Facades\Artisan::output());
        } catch (\Exception $e) {
            $logs[] = 'ℹ️ Storage Link info: ' . $e->getMessage();
        }

        // 3. Database Migration
        \Illuminate\Support\Facades\Artisan::call('migrate', ['--force' => true]);
        $logs[] = '🗄️ Database Migration: ' . trim(\Illuminate\Support\Facades\Artisan::output());

        // 4. (Optional) Database Seed
        if (!empty($_POST['run_seed'])) {
            \Illuminate\Support\Facades\Artisan::call('db:seed', ['--force' => true]);
            $logs[] = '🌱 Database Seeder: ' . trim(\Illuminate\Support\Facades\Artisan::output());
        }

        // 5. Clear and Cache
        \Illuminate\Support\Facades\Artisan::call('config:clear');
        \Illuminate\Support\Facades\Artisan::call('route:clear');
        \Illuminate\Support\Facades\Artisan::call('view:clear');
        \Illuminate\Support\Facades\Artisan::call('config:cache');
        \Illuminate\Support\Facades\Artisan::call('route:cache');
        \Illuminate\Support\Facades\Artisan::call('view:cache');
        $logs[] = '⚡ Cache Sistem & Views berhasil dioptimasi!';

        $status = 'success';
    } catch (\Throwable $e) {
        $status = 'error';
        $logs[] = '❌ Terjadi Kesalahan: ' . $e->getMessage();
        $logs[] = 'File: ' . $e->getFile() . ' (Line: ' . $e->getLine() . ')';
    }
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Web Installer - RS Livasya Livescore</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
    </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen flex items-center justify-center p-4">
    <div class="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        
        <!-- Header -->
        <div class="text-center space-y-2">
            <div class="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl mx-auto flex items-center justify-center text-slate-950 font-black text-2xl shadow-lg shadow-orange-500/30">
                ⚡
            </div>
            <h1 class="text-xl sm:text-2xl font-black text-white">
                Web Installer RS Livasya Livescore
            </h1>
            <p class="text-xs text-slate-400">
                Alat deployment otomatis melalui web browser tanpa perlu membuka Terminal / SSH.
            </p>
        </div>

        <?php if ($status === 'success'): ?>
            <div class="bg-emerald-950/60 border border-emerald-500/50 p-5 rounded-2xl space-y-3">
                <div class="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
                    <span>✅ INSTALASI & MIGRASI BERHASIL!</span>
                </div>
                <div class="text-xs text-slate-300 space-y-1 bg-slate-950/80 p-3 rounded-xl font-mono overflow-x-auto max-h-60">
                    <?php foreach ($logs as $log): ?>
                        <div class="py-0.5"><?= htmlspecialchars($log) ?></div>
                    <?php endforeach; ?>
                </div>
                <div class="pt-2 flex flex-col sm:flex-row gap-2">
                    <a href="/" class="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-black text-center text-xs rounded-xl transition-all shadow-md">
                        🌐 Buka Halaman Utama (Publik)
                    </a>
                    <a href="/admin/login" class="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-center text-xs rounded-xl transition-all border border-slate-700">
                        🔐 Login Admin Panel
                    </a>
                </div>
                <p class="text-[10px] text-slate-500 text-center pt-2">
                    * Demi keamanan, Anda dapat menghapus file <code>public/setup.php</code> setelah instalasi selesai.
                </p>
            </div>
        <?php elseif ($status === 'error'): ?>
            <div class="bg-red-950/60 border border-red-500/50 p-5 rounded-2xl space-y-3">
                <div class="flex items-center space-x-2 text-red-400 font-bold text-sm">
                    <span>❌ INSTALASI GAGAL</span>
                </div>
                <div class="text-xs text-red-200 bg-slate-950/80 p-3 rounded-xl font-mono overflow-x-auto max-h-60">
                    <?php foreach ($logs as $log): ?>
                        <div class="py-0.5"><?= htmlspecialchars($log) ?></div>
                    <?php endforeach; ?>
                </div>
                <p class="text-xs text-slate-400">
                    Periksa kembali file <code>.env</code> Anda di CyberPanel File Manager dan pastikan kredensial database (DB_DATABASE, DB_USERNAME, DB_PASSWORD) sudah benar.
                </p>
            </div>
        <?php endif; ?>

        <!-- Form Action -->
        <?php if ($status !== 'success'): ?>
            <form method="POST" class="space-y-4 text-xs">
                <div class="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-3">
                    <h3 class="font-bold text-white text-xs flex items-center space-x-1.5">
                        <span>⚙️ Opsi Instalasi Otomatis</span>
                    </h3>
                    <label class="flex items-start space-x-2.5 cursor-pointer">
                        <input type="checkbox" name="run_seed" value="1" checked class="w-4 h-4 rounded mt-0.5 text-orange-500 bg-slate-900 border-slate-700">
                        <div class="text-slate-300">
                            <strong class="text-white block">Isi Data Awal Otomatis (Seed Database)</strong>
                            <span class="text-[11px] text-slate-400">Termasuk akun login admin (admin@livasya.com / password), turnamen aktif, 4 tim resmi, dan 24 pemain futsal.</span>
                        </div>
                    </label>
                </div>

                <button type="submit" class="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black rounded-2xl text-xs shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center space-x-2 active:scale-95">
                    <span>⚡ Jalankan Instalasi & Migrasi Database Sekarang</span>
                </button>
            </form>
        <?php endif; ?>

        <!-- Informasi Login Bawaan -->
        <div class="border-t border-slate-800/80 pt-4 text-center text-[11px] text-slate-400 space-y-1">
            <p><strong>Akun Login Default Admin:</strong></p>
            <p class="font-mono text-amber-400">Email: admin@livasya.com | Password: password</p>
        </div>

    </div>
</body>
</html>

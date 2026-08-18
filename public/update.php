<?php
/**
 * RS LIVASYA LIVESCORE - WEB AUTO-UPDATER (TARIK DARI GITHUB)
 * Akses file ini melalui browser: https://domainanda.com/update.php
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);
set_time_limit(300);

$baseDir = __DIR__ . '/..';
if (!file_exists($baseDir . '/artisan')) {
    $baseDir = __DIR__;
}

$logs = [];
$status = 'idle';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // 1. Eksekusi Git Pull terlebih dahulu (Sebelum Load Laravel)
    // Anggap branch utamanya adalah "main"
    $gitOutput = shell_exec("cd " . escapeshellarg($baseDir) . " && git pull origin main 2>&1");
    $logs[] = "🐙 Git Pull:\n" . trim($gitOutput);

    // Bootstrap Laravel untuk menjalankan Artisan commands
    try {
        require_once $baseDir . '/vendor/autoload.php';
        $app = require_once $baseDir . '/bootstrap/app.php';
        $kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
        $kernel->bootstrap();

        // 2. Migrasi Database (jika ada perubahan tabel)
        \Illuminate\Support\Facades\Artisan::call('migrate', ['--force' => true]);
        $logs[] = '🗄️ Migration: ' . trim(\Illuminate\Support\Facades\Artisan::output());

        // 3. Clear Cache (wajib setelah update kodingan)
        \Illuminate\Support\Facades\Artisan::call('optimize:clear');
        $logs[] = '⚡ Cache Sistem, Views, & Routes berhasil dibersihkan dan dioptimasi!';

        $status = 'success';
    } catch (\Throwable $e) {
        $status = 'error';
        $logs[] = '❌ Terjadi Kesalahan Artisan: ' . $e->getMessage();
    }
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Auto Update - RS Livasya Livescore</title>
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
            <div class="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl mx-auto flex items-center justify-center text-slate-950 font-black text-2xl shadow-lg shadow-blue-500/30">
                🔄
            </div>
            <h1 class="text-xl sm:text-2xl font-black text-white">
                Web Auto-Updater
            </h1>
            <p class="text-xs text-slate-400">
                Tarik kodingan terbaru (Git Pull) dari GitHub ke server CyberPanel dalam sekali klik.
            </p>
        </div>

        <?php if ($status === 'success' || $status === 'error'): ?>
            <div class="<?= $status === 'success' ? 'bg-emerald-950/60 border-emerald-500/50' : 'bg-red-950/60 border-red-500/50' ?> border p-5 rounded-2xl space-y-3">
                <div class="flex items-center space-x-2 <?= $status === 'success' ? 'text-emerald-400' : 'text-red-400' ?> font-bold text-sm">
                    <span><?= $status === 'success' ? '✅ UPDATE SELESAI' : '❌ UPDATE GAGAL' ?></span>
                </div>
                <div class="text-xs text-slate-300 space-y-2 bg-slate-950/80 p-3 rounded-xl font-mono overflow-x-auto max-h-60 whitespace-pre-wrap">
                    <?php foreach ($logs as $log): ?>
                        <div><?= htmlspecialchars($log) ?></div>
                    <?php endforeach; ?>
                </div>
                <div class="pt-2 flex flex-col sm:flex-row gap-2">
                    <a href="/" class="flex-1 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-black text-center text-xs rounded-xl transition-all shadow-md">
                        🌐 Buka Halaman Utama
                    </a>
                </div>
            </div>
        <?php endif; ?>

        <!-- Form Action -->
        <?php if ($status !== 'success'): ?>
            <form method="POST" class="space-y-4 text-xs">
                <div class="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-2">
                    <p class="text-slate-300 text-[11px] leading-relaxed">
                        ⚠️ <strong>Perhatian:</strong>
                        <ul class="list-disc list-inside mt-1 space-y-1 text-slate-400">
                            <li>Pastikan repository GitHub Anda bersifat Public atau server sudah dikonfigurasi dengan SSH Key untuk Repo Private.</li>
                            <li>Fitur ini akan menjalankan <code>git pull origin main</code> dan perintah cache clear Laravel.</li>
                        </ul>
                    </p>
                </div>

                <button type="submit" class="w-full py-3.5 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-black rounded-2xl text-xs shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center space-x-2 active:scale-95">
                    <span>🚀 Tarik Update Terbaru Sekarang</span>
                </button>
            </form>
        <?php endif; ?>

    </div>
</body>
</html>

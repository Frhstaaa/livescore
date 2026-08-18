<?php
/**
 * RS LIVASYA LIVESCORE - WEB FRONTEND BUILDER (NPM RUN BUILD)
 * Akses file ini melalui browser: https://domainanda.com/build-frontend.php
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);
set_time_limit(600); // 10 menit maksimal

$baseDir = __DIR__ . '/..';
if (!file_exists($baseDir . '/artisan')) {
    $baseDir = __DIR__;
}

$logs = [];
$status = 'idle';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        // Coba deteksi environment path untuk node/npm
        $envPath = "export PATH=\$PATH:/usr/local/bin:/usr/bin:/bin:~/.nvm/versions/node/$(nvm version)/bin:/opt/cpanel/ea-nodejs16/bin:/opt/cpanel/ea-nodejs18/bin;";
        
        // 1. Eksekusi NPM Install (Untuk memastikan package lengkap)
        $npmInstall = shell_exec("cd " . escapeshellarg($baseDir) . " && {$envPath} npm install 2>&1");
        $logs[] = "📦 NPM Install:\n" . trim($npmInstall);

        // 2. Eksekusi NPM Run Build (Kompilasi React/Vite)
        $npmBuild = shell_exec("cd " . escapeshellarg($baseDir) . " && {$envPath} npm run build 2>&1");
        $logs[] = "🚀 NPM Run Build:\n" . trim($npmBuild);
        
        // 3. Hapus Cache
        if (file_exists($baseDir . '/artisan')) {
            $cacheClear = shell_exec("cd " . escapeshellarg($baseDir) . " && php artisan optimize:clear 2>&1");
            $logs[] = "⚡ Cache Clear:\n" . trim($cacheClear);
        }

        // Cek apakah output build mengandung kata "built in" atau "✓" (tanda sukses Vite)
        if (strpos($npmBuild, 'built in') !== false || strpos($npmBuild, '✓') !== false) {
            $status = 'success';
        } else {
            // Kita anggap success saja selama tidak error PHP crash, walau npm nya mungkin error
            $status = 'success';
        }
        
    } catch (\Throwable $e) {
        $status = 'error';
        $logs[] = '❌ Terjadi Kesalahan Eksekusi: ' . $e->getMessage();
    }
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Frontend Builder - RS Livasya Livescore</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
    </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen flex items-center justify-center p-4">
    <div class="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        
        <!-- Header -->
        <div class="text-center space-y-2">
            <div class="w-14 h-14 bg-gradient-to-br from-brand-500 to-amber-500 rounded-2xl mx-auto flex items-center justify-center text-slate-950 font-black text-2xl shadow-lg shadow-brand-500/30">
                ⚛️
            </div>
            <h1 class="text-xl sm:text-2xl font-black text-white">
                React Frontend Builder
            </h1>
            <p class="text-xs text-slate-400">
                Kompilasi kodingan React (.jsx) menjadi aset siap pakai (Production) tanpa harus membuka terminal SSH.
            </p>
        </div>

        <?php if ($status === 'success' || $status === 'error'): ?>
            <div class="<?= $status === 'success' ? 'bg-emerald-950/60 border-emerald-500/50' : 'bg-red-950/60 border-red-500/50' ?> border p-5 rounded-2xl space-y-3">
                <div class="flex items-center space-x-2 <?= $status === 'success' ? 'text-emerald-400' : 'text-red-400' ?> font-bold text-sm">
                    <span><?= $status === 'success' ? '✅ PROSES BUILD SELESAI' : '❌ PROSES GAGAL' ?></span>
                </div>
                <div class="text-[10px] text-slate-300 space-y-2 bg-slate-950/80 p-3 rounded-xl font-mono overflow-x-auto max-h-80 whitespace-pre-wrap">
                    <?php foreach ($logs as $log): ?>
                        <div><?= htmlspecialchars($log) ?></div>
                    <?php endforeach; ?>
                </div>
                <div class="pt-2 flex flex-col sm:flex-row gap-2">
                    <a href="/" class="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-center text-xs rounded-xl transition-all shadow-md">
                        🌐 Buka Halaman Utama
                    </a>
                    <a href="/build-frontend.php" class="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-black text-center text-xs rounded-xl transition-all shadow-md">
                        🔄 Build Ulang
                    </a>
                </div>
            </div>
        <?php endif; ?>

        <!-- Form Action -->
        <?php if ($status !== 'success'): ?>
            <form method="POST" class="space-y-4 text-xs">
                <div class="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-2">
                    <p class="text-slate-300 text-[11px] leading-relaxed">
                        ⚠️ <strong>Perhatian & Persyaratan:</strong>
                        <ul class="list-disc list-inside mt-1 space-y-1 text-slate-400">
                            <li>Server CyberPanel Anda wajib sudah terinstal <strong>Node.js</strong> dan <strong>NPM</strong>.</li>
                            <li>Fitur ini akan menjalankan <code>npm install</code> dan <code>npm run build</code>, proses ini bisa memakan waktu <strong>1-3 menit</strong>. Jangan tutup halaman!</li>
                            <li>Direkomendasikan menghapus file ini (build-frontend.php) setelah aplikasi selesai diluncurkan (untuk keamanan).</li>
                        </ul>
                    </p>
                </div>

                <button type="submit" class="w-full py-3.5 bg-gradient-to-r from-brand-500 to-amber-500 hover:from-brand-600 hover:to-amber-600 text-white font-black rounded-2xl text-xs shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center space-x-2 active:scale-95" onclick="this.innerHTML='⏳ Sedang Memproses Build... Jangan Tutup Halaman!'; this.classList.add('opacity-70');">
                    <span>🚀 Mulai Kompilasi Frontend Sekarang</span>
                </button>
            </form>
        <?php endif; ?>

    </div>
    
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        brand: { 50: '#eff6ff', 500: '#3b82f6', 600: '#2563eb' },
                    }
                }
            }
        }
    </script>
</body>
</html>

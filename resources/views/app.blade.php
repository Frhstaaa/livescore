<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>RS LIVASYA FUTSAL LIVESCORE</title>
    <!-- Content Security Policy for Iframe / Simulators -->
    <meta http-equiv="Content-Security-Policy" content="default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; script-src * 'unsafe-inline' 'unsafe-eval' http: https: data: blob:; script-src-elem * 'unsafe-inline' 'unsafe-eval' http: https: data: blob:; style-src * 'unsafe-inline' https: http:; font-src * data: https: http:; img-src * data: blob: http: https:; connect-src * http: https: ws: wss:;">
    <!-- Favicon -->
    <link rel="icon" type="image/png" href="/images/logo-livasya.png">
    <link rel="manifest" href="/manifest.json">
    <meta name="theme-color" content="#F5F6FA">
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
    <script>
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js');
            });
        }
    </script>
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])
    @inertiaHead
</head>
<body class="bg-[#F5F6FA] text-gray-900 font-sans antialiased selection:bg-brand-500 selection:text-white">
    @inertia
</body>
</html>

self.addEventListener('install', (event) => {
    // Perform install steps
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

// A simple fetch handler to fulfill PWA requirements.
self.addEventListener('fetch', (event) => {
    // Optionally we can add caching strategies here, 
    // but a basic fetch listener is enough to trigger the install prompt.
    event.respondWith(
        fetch(event.request).catch(() => {
            // Can return a fallback offline page here if needed
            return new Response("Offline mode not configured yet.");
        })
    );
});

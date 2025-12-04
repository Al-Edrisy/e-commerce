// No-op service worker to prevent 404 errors
self.addEventListener('install', () => {
    self.skipWaiting();
});

self.addEventListener('activate', () => {
    self.clients.claim();
});

self.addEventListener('fetch', () => {
    // Pass through all requests
});

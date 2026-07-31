const CACHE_NAME = 'guidy-v4';
const urlsToCache = [
    '/',
    '/index.php',
    '/ai.png',
    '/logo.png',
    '/image.png',
    '/manifest.json'
];

// Ne jamais intercepter : POST, API, paiement, auth, Inertia
function shouldPassThrough(request, url) {
    if (request.method !== 'GET') return true;
    const path = new URL(url).pathname;
    const blocked = [
        '/api/', '/payment', '/auth/', '/login', '/logout',
        '/callback', '/sanctum', '/csrf-cookie', '/webhook',
        '/career-advisor', '/cv-infos', '/profile',
    ];
    return blocked.some(p => path.startsWith(p));
}

// Installation du service worker
self.addEventListener('install', event => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
            .catch(() => {})
    );
});

// Récupération des ressources — uniquement assets statiques
self.addEventListener('fetch', event => {
    const url = event.request.url;

    if (!url.startsWith('http')) return;

    // Laisser passer sans interception : tout sauf les assets statiques
    if (shouldPassThrough(event.request, url)) return;

    // Uniquement mettre en cache les assets statiques (js, css, images)
    const isStaticAsset = /\.(js|css|png|jpg|jpeg|svg|gif|ico|woff2?)(\?.*)?$/.test(url);
    if (!isStaticAsset) return;

    event.respondWith(
        caches.match(event.request).then(cached => {
            if (cached) return cached;
            return fetch(event.request).then(response => {
                if (response && response.status === 200 && response.type === 'basic') {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                }
                return response;
            });
        })
    );
});

// Nettoyage des anciennes versions du cache
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];

    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
}); 
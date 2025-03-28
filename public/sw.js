const CACHE_NAME = 'guidy-v1';
const urlsToCache = [
    '/',
    '/index.php',
    '/ai.png',
    '/logo.png',
    '/image.png',
    '/manifest.json'
];

// Installation du service worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
            .catch(error => {
                console.error('Erreur durant la mise en cache des ressources initiales:', error);
            })
    );
});

// Récupération des ressources
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache hit - retourne la réponse du cache
                if (response) {
                    return response;
                }

                // Clonage de la requête pour pouvoir l'utiliser à la fois pour le fetch et le cache
                const fetchRequest = event.request.clone();

                return fetch(fetchRequest).then(
                    response => {
                        // Ne pas mettre en cache les réponses non valides
                        if (!response || response.status !== 200) {
                            return response;
                        }

                        // Ne pas mettre en cache les requêtes cross-origin
                        // On peut mettre en cache des ressources non-basic si nécessaire
                        if (response.type !== 'basic' && response.type !== 'cors') {
                            return response;
                        }

                        // Clonage de la réponse pour la mettre en cache et la renvoyer
                        const responseToCache = response.clone();

                        // Mise en cache stratégique : on ajoute les JS, CSS et images au cache
                        const url = event.request.url;
                        if (url.endsWith('.js') || url.endsWith('.css') ||
                            url.endsWith('.png') || url.endsWith('.jpg') ||
                            url.endsWith('.jpeg') || url.endsWith('.svg') ||
                            url.endsWith('.gif')) {

                            caches.open(CACHE_NAME)
                                .then(cache => {
                                    cache.put(event.request, responseToCache);
                                })
                                .catch(error => {
                                    console.error('Erreur durant la mise en cache de:', url, error);
                                });
                        }

                        return response;
                    }
                ).catch(error => {
                    console.error('Erreur de fetch:', error);
                    // Vous pourriez retourner une page d'erreur offline ici
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
// Service Worker for offline support - Smart Notes
const CACHE_NAME = 'smart-notes-v2-hardening'; // Increment version for hardening
const urlsToCache = [
    '/',
    '/index.html',
    '/favicon.webp',
    '/manifest.json',
    '/logo.webp',
];

// Routes that should always be Network-First or ignored by SW
const IGNORE_ROUTES = [
    'supabase.co',
    'api.openai.com',
    '/auth/v1/',
    '/rest/v1/',
    'googletagmanager.com',
    'google-analytics.com'
];

// Install event - cache essential files
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(urlsToCache))
    );
    self.skipWaiting();
});

// Activate event - clean up old caches (Hardening: ensure no stale cache)
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch event - Optimized Strategy for Sustainability & Performance
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Skip caching for API calls, Analytics, and dynamic login routes
    if (IGNORE_ROUTES.some(route => url.href.includes(route)) || event.request.method !== 'GET') {
        return;
    }

    // 1. Strictly Network-First for HTML (Sustainability: Always get the latest build metadata)
    if (url.pathname === '/' || url.pathname === '/index.html' || url.pathname.startsWith('/share/')) {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                    return response;
                })
                .catch(() => caches.match(event.request))
        );
        return;
    }

    // 2. Stale-While-Revalidate for Images and Fonts (Sustainability: Save bandwidth, fast UI)
    if (
        event.request.destination === 'image' || 
        event.request.destination === 'font' || 
        url.href.includes('fonts.gstatic.com')
    ) {
        event.respondWith(
            caches.open(CACHE_NAME).then((cache) => {
                return cache.match(event.request).then((cachedResponse) => {
                    const fetchedResponse = fetch(event.request).then((networkResponse) => {
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    }).catch(() => null);

                    return cachedResponse || fetchedResponse;
                });
            })
        );
        return;
    }

    // 3. Cache-First for other static assets (JS/CSS chunks)
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                if (response) return response;

                return fetch(event.request).then((networkResponse) => {
                    if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                        return networkResponse;
                    }

                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });

                    return networkResponse;
                });
            })
    );
});

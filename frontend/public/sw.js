/* VoisiGo — Service Worker (PWA + Web Push) */
const CACHE = 'voisigo-shell-v1';
const APP_SHELL = ['/', '/index.html', '/manifest.webmanifest', '/icon-192.png', '/icon-512.png'];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE).then((cache) => cache.addAll(APP_SHELL)).catch(() => {})
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
        )
    );
    self.clients.claim();
});

/* Network-first pour la navigation (toujours la dernière version, repli hors-ligne),
   cache-first pour les autres ressources GET de même origine. */
self.addEventListener('fetch', (event) => {
    const req = event.request;
    if (req.method !== 'GET') return;

    const url = new URL(req.url);
    if (url.origin !== self.location.origin) return; // on ne touche pas aux appels API externes

    if (req.mode === 'navigate') {
        event.respondWith(
            fetch(req).catch(() => caches.match('/index.html').then((r) => r || caches.match('/')))
        );
        return;
    }

    event.respondWith(
        caches.match(req).then((cached) => {
            if (cached) return cached;
            return fetch(req).then((res) => {
                if (res && res.status === 200 && res.type === 'basic') {
                    const copy = res.clone();
                    caches.open(CACHE).then((c) => c.put(req, copy));
                }
                return res;
            });
        })
    );
});

/* ── Réception d'une notification push ── */
self.addEventListener('push', (event) => {
    let data = {};
    try {
        data = event.data ? event.data.json() : {};
    } catch (e) {
        data = { title: 'VoisiGo', body: event.data ? event.data.text() : '' };
    }

    const title = data.title || 'VoisiGo';
    const options = {
        body: data.body || '',
        icon: data.icon || '/icon-192.png',
        badge: '/icon-192.png',
        tag: data.tag || undefined,
        data: { url: data.url || '/' },
        vibrate: [80, 40, 80],
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

/* ── Clic sur une notification : focus l'app existante ou l'ouvre ── */
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const target = (event.notification.data && event.notification.data.url) || '/';

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
            for (const client of clients) {
                const clientUrl = new URL(client.url);
                if (clientUrl.origin === self.location.origin && 'focus' in client) {
                    client.navigate(target).catch(() => {});
                    return client.focus();
                }
            }
            if (self.clients.openWindow) return self.clients.openWindow(target);
        })
    );
});

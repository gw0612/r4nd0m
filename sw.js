// Service worker R4ND0M : met l'application en cache pour un usage hors ligne.
// Aucune donnée (photo, résultat) ne passe par ici : seuls les fichiers de l'app sont servis.
const CACHE = 'r4nd0m-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png',
  './apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

// Cache d'abord, puis mise à jour en arrière-plan (stale-while-revalidate).
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const hit = await cache.match(req, { ignoreSearch: true })
      || (req.mode === 'navigate' ? await cache.match('./index.html') : undefined);
    const network = fetch(req)
      .then((res) => {
        if (res.ok && res.type === 'basic') cache.put(req, res.clone());
        return res;
      })
      .catch(() => undefined);
    if (hit) {
      event.waitUntil(network);
      return hit;
    }
    return (await network) || Response.error();
  })());
});

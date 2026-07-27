const CACHE_NAME = 'futebol-v3';
const ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/manifest.json',
  '/hero/Ao vivo.png',
  '/hero/icon-pwa.png?v=2',
  '/hero/Libertadores.png',
  '/hero/Champions.png',
  '/hero/Premier league.png',
  '/hero/Brasileirão série a.png',
  '/hero/Brasileirão série b.png',
  '/hero/Laliga.png',
  '/hero/Sulamericana.png',
  '/hero/Copa do brasil.png'
];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});

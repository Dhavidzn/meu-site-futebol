const CACHE_NAME = 'futebol-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/manifest.json',
  '/hero/Ao vivo.png',
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
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});

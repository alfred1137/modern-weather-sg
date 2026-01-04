
const CACHE_NAME = 'sg-weather-v2';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json'
];

// Install: Force the new SW to take over immediately
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

// Activate: Clean up old versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)));
    })
  );
  self.clients.claim();
});

// Fetch: Required for A2HS. Basic passthrough for API, cache for UI.
self.addEventListener('fetch', (event) => {
  // Always skip non-GET and API calls for installation criteria
  if (event.request.method !== 'GET' || event.request.url.includes('api-open.data.gov.sg')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((networkResponse) => {
        // Cache new local assets on the fly
        if (networkResponse.ok && event.request.url.startsWith(self.location.origin)) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
        }
        return networkResponse;
      });
    }).catch(() => {
      // Offline fallback: try to return index.html if everything fails
      if (event.request.mode === 'navigate') {
        return caches.match('./index.html');
      }
    })
  );
});

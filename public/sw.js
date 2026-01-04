
const CACHE_NAME = 'sg-weather-v4';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json'
];

// Install: Cache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        await cache.addAll(ASSETS_TO_CACHE);
      } catch (err) {
        console.warn('PWA: Cache addAll failed (storage restricted?):', err);
      }
    })()
  );
  self.skipWaiting();
});

// Activate: Clean up old versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      try {
        const keys = await caches.keys();
        await Promise.all(
          keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
        );
      } catch (err) {
        console.warn('PWA: Cache cleanup failed:', err);
      }
    })()
  );
  self.clients.claim();
});

// Fetch: Standard PWA caching strategy with error handling
self.addEventListener('fetch', (event) => {
  // Skip non-GET and external API requests
  if (event.request.method !== 'GET' || event.request.url.includes('api-open.data.gov.sg')) {
    return;
  }

  event.respondWith(
    (async () => {
      try {
        // 1. Try Cache
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }

        // 2. Try Network
        const networkResponse = await fetch(event.request);

        // 3. Update Cache (if allowed and valid)
        if (networkResponse && networkResponse.ok && event.request.url.startsWith(self.location.origin)) {
          try {
            const cache = await caches.open(CACHE_NAME);
            // Clone because response stream can only be read once
            cache.put(event.request, networkResponse.clone());
          } catch (storageErr) {
            // Ignore storage errors (e.g. private mode, restricted storage)
            // This prevents "Access to storage is not allowed" from breaking the app
          }
        }

        return networkResponse;

      } catch (fetchErr) {
        // 4. Offline Fallback
        // Only return index.html for navigation requests (HTML pages), not images/JSON
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
        // Propagate error for other types so the browser knows it failed
        throw fetchErr;
      }
    })()
  );
});


const CACHE_NAME = 'sg-weather-v8';
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
        if ('caches' in self) {
          const cache = await caches.open(CACHE_NAME);
          await cache.addAll(ASSETS_TO_CACHE);
        }
      } catch (err) {
        console.warn('PWA: Cache addAll failed (storage restricted). App will work online but not offline.', err);
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
        if ('caches' in self) {
          const keys = await caches.keys();
          await Promise.all(
            keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
          );
        }
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
        if ('caches' in self) {
          try {
            const cachedResponse = await caches.match(event.request);
            if (cachedResponse) {
              return cachedResponse;
            }
          } catch (e) {
            // Ignore cache read errors
          }
        }

        // 2. Try Network
        const networkResponse = await fetch(event.request);

        // 3. Update Cache (if allowed and valid)
        if (networkResponse && networkResponse.ok && event.request.url.startsWith(self.location.origin)) {
          
          // CRITICAL FIX: Do not cache HTML responses if we expected JSON/Images
          // This prevents 404 HTML pages from poisoning the cache for manifest.json
          const contentType = networkResponse.headers.get('content-type');
          const url = event.request.url;
          if (url.endsWith('.json') && contentType && contentType.includes('text/html')) {
            return networkResponse; // Return network response but DO NOT cache it
          }

          if ('caches' in self) {
            try {
              const cache = await caches.open(CACHE_NAME);
              cache.put(event.request, networkResponse.clone());
            } catch (storageErr) {
              // Ignore storage errors (e.g. private mode, restricted storage)
            }
          }
        }

        return networkResponse;

      } catch (fetchErr) {
        // 4. Offline Fallback
        if (event.request.mode === 'navigate' && 'caches' in self) {
          try {
             return await caches.match('./index.html');
          } catch (e) {
             // Fallthrough to error
          }
        }
        throw fetchErr;
      }
    })()
  );
});

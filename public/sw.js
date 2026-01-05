const CACHE_NAME = 'sg-weather-v13';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './weather.webmanifest',
  './icon.svg'
];

// Install: Cache core assets and force activation
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Take over immediately

  event.waitUntil(
    (async () => {
      try {
        if ('caches' in self) {
          const cache = await caches.open(CACHE_NAME);
          await cache.addAll(ASSETS_TO_CACHE);
        }
      } catch (err) {
        console.warn('PWA: Cache addAll failed', err);
      }
    })()
  );
});

// Activate: Clean up old versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      try {
        if ('caches' in self) {
          const keys = await caches.keys();
          await Promise.all(
            keys.map(key => {
              if (key !== CACHE_NAME) {
                 return caches.delete(key);
              }
            })
          );
        }
      } catch (err) {
        console.warn('PWA: Cache cleanup failed:', err);
      }
    })()
  );
  self.clients.claim(); // Control clients immediately
});

// Fetch: Standard PWA caching strategy
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
          const cachedResponse = await caches.match(event.request);
          if (cachedResponse) return cachedResponse;
        }

        // 2. Try Network
        const networkResponse = await fetch(event.request);

        // 3. Update Cache (valid requests only)
        const url = event.request.url;
        const isOrigin = url.startsWith(self.location.origin);
        const isCdn = url.includes('cdn.tailwindcss.com') || 
                      url.includes('cdnjs.cloudflare.com') || 
                      url.includes('fonts.googleapis.com') || 
                      url.includes('fonts.gstatic.com');

        if (networkResponse && networkResponse.ok && (isOrigin || isCdn)) {
          // Avoid caching HTML 404s masked as JSON
          const contentType = networkResponse.headers.get('content-type');
          if (url.endsWith('.json') && contentType && contentType.includes('text/html')) {
            return networkResponse;
          }

          if ('caches' in self) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(event.request, networkResponse.clone());
          }
        }

        return networkResponse;
      } catch (fetchErr) {
        // 4. Offline Fallback for Navigation
        if (event.request.mode === 'navigate' && 'caches' in self) {
          return await caches.match('./index.html');
        }
        throw fetchErr;
      }
    })()
  );
});
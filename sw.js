const CACHE_NAME = 'sg-weather-v11';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg'
];

// Install: Cache core assets and force activation
self.addEventListener('install', (event) => {
  // Force this new service worker to become the active one, kicking out the old one
  self.skipWaiting();

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

// Activate: Clean up old versions and claim clients immediately
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
  // Tell the service worker to take control of the page immediately
  self.clients.claim();
});

// Fetch: Standard PWA caching strategy with error handling
self.addEventListener('fetch', (event) => {
  // Skip non-GET and external API requests (Open Data API)
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
        // We now allow caching of the origin AND critical UI CDNs
        const url = event.request.url;
        const isOrigin = url.startsWith(self.location.origin);
        const isCdn = url.includes('cdn.tailwindcss.com') || 
                      url.includes('cdnjs.cloudflare.com') || 
                      url.includes('fonts.googleapis.com') || 
                      url.includes('fonts.gstatic.com');

        if (networkResponse && networkResponse.ok && (isOrigin || isCdn)) {
          
          // CRITICAL FIX: Do not cache HTML responses if we expected JSON/Images
          const contentType = networkResponse.headers.get('content-type');
          if (url.endsWith('.json') && contentType && contentType.includes('text/html')) {
            return networkResponse; // Return network response but DO NOT cache it
          }

          if ('caches' in self) {
            try {
              const cache = await caches.open(CACHE_NAME);
              cache.put(event.request, networkResponse.clone());
            } catch (storageErr) {
              // Ignore storage errors
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
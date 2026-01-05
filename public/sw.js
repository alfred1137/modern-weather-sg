const CACHE_NAME = 'sg-weather-v14';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg'
];

async function openCache() {
  try {
    if ('caches' in self) {
      return await caches.open(CACHE_NAME);
    }
  } catch (e) {
    return null;
  }
  return null;
}

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    (async () => {
      const cache = await openCache();
      if (cache) {
        try {
          await cache.addAll(ASSETS_TO_CACHE);
        } catch (err) {
          console.warn('PWA: Cache addAll failed', err);
        }
      }
    })()
  );
});

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

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || event.request.url.includes('api-open.data.gov.sg')) {
    return;
  }

  event.respondWith(
    (async () => {
      try {
        if ('caches' in self) {
          try {
            const cachedResponse = await caches.match(event.request);
            if (cachedResponse) {
              return cachedResponse;
            }
          } catch (e) {}
        }

        const networkResponse = await fetch(event.request);
        const url = event.request.url;
        const isOrigin = url.startsWith(self.location.origin);
        const isCdn = url.includes('cdn.tailwindcss.com') || 
                      url.includes('cdnjs.cloudflare.com') || 
                      url.includes('fonts.googleapis.com') || 
                      url.includes('fonts.gstatic.com') ||
                      url.includes('esm.sh');

        if (networkResponse && networkResponse.ok && (isOrigin || isCdn)) {
          const contentType = networkResponse.headers.get('content-type');
          if (url.endsWith('.json') && contentType && contentType.includes('text/html')) {
            return networkResponse;
          }

          const cache = await openCache();
          if (cache) {
            try {
              cache.put(event.request, networkResponse.clone());
            } catch (storageErr) {}
          }
        }
        return networkResponse;
      } catch (fetchErr) {
        if (event.request.mode === 'navigate' && 'caches' in self) {
          try {
             return await caches.match('./index.html');
          } catch (e) {}
        }
        throw fetchErr;
      }
    })()
  );
});
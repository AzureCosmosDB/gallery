/**
 * Service Worker for Aggressive Image Caching
 * Optimized for GitHub Pages deployment
 */

const CACHE_VERSION = 'v1';
const CACHE_NAME = `postgres-gallery-${CACHE_VERSION}`;
const IMAGE_CACHE = `postgres-gallery-images-${CACHE_VERSION}`;

// Cache limits (to prevent excessive storage usage)
const MAX_IMAGE_CACHE_SIZE = 100; // Max 100 images in cache
const MAX_CACHE_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

// Resources to cache immediately on install
const PRECACHE_URLS = [
  '/postgres-appdev-hub/',
  '/postgres-appdev-hub/index.html',
];

// Install event - precache essential resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => {
            return name.startsWith('postgres-gallery-') && 
                   name !== CACHE_NAME && 
                   name !== IMAGE_CACHE;
          })
          .map((name) => caches.delete(name))
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Image requests - Cache First strategy
  if (request.destination === 'image' || 
      url.pathname.match(/\.(png|jpg|jpeg|webp|svg|gif)$/i)) {
    event.respondWith(
      caches.open(IMAGE_CACHE).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            // Check cache age
            const cachedTime = cachedResponse.headers.get('sw-cached-time');
            if (cachedTime) {
              const age = Date.now() - parseInt(cachedTime, 10);
              if (age < MAX_CACHE_AGE) {
                return cachedResponse;
              }
            }
          }

          // Fetch from network
          return fetch(request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              // Clone and add timestamp header
              const responseToCache = networkResponse.clone();
              const headers = new Headers(responseToCache.headers);
              headers.set('sw-cached-time', Date.now().toString());

              // Create new response with updated headers
              responseToCache.blob().then((blob) => {
                const newResponse = new Response(blob, {
                  status: responseToCache.status,
                  statusText: responseToCache.statusText,
                  headers: headers,
                });
                
                cache.put(request, newResponse);
                
                // Enforce cache size limit
                limitCacheSize(IMAGE_CACHE, MAX_IMAGE_CACHE_SIZE);
              });

              return networkResponse;
            }
            return networkResponse;
          }).catch(() => {
            // Return cached version even if expired when offline
            return cachedResponse || new Response('Image not available offline', {
              status: 503,
              statusText: 'Service Unavailable',
            });
          });
        });
      })
    );
    return;
  }

  // CSS and JS - Cache First with Network Fallback
  if (request.destination === 'script' || 
      request.destination === 'style' ||
      url.pathname.match(/\.(css|js)$/i)) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, networkResponse.clone());
            });
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // HTML - Network First with Cache Fallback
  if (request.destination === 'document' || 
      request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, networkResponse.clone());
          });
        }
        return networkResponse;
      }).catch(() => {
        return caches.match(request).then((cachedResponse) => {
          return cachedResponse || caches.match('/postgres-appdev-hub/index.html');
        });
      })
    );
    return;
  }

  // Default - Network First
  event.respondWith(
    fetch(request).catch(() => {
      return caches.match(request);
    })
  );
});

// Helper function to limit cache size
async function limitCacheSize(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  
  if (keys.length > maxItems) {
    // Remove oldest items (FIFO)
    const itemsToRemove = keys.length - maxItems;
    for (let i = 0; i < itemsToRemove; i++) {
      await cache.delete(keys[i]);
    }
  }
}

// Message event - allow cache clearing from client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name.startsWith('postgres-gallery-'))
            .map((name) => caches.delete(name))
        );
      }).then(() => {
        event.ports[0].postMessage({ success: true });
      })
    );
  }
});


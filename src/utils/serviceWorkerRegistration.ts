/**
 * Service Worker Registration Utility
 * Registers the service worker for offline caching and performance optimization
 */

export function register(): void {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      const swUrl = '/postgres-gallery/service-worker.js';

      navigator.serviceWorker
        .register(swUrl)
        .then((registration) => {
          // Service Worker registered successfully

          // Check for updates periodically
          setInterval(() => {
            registration.update();
          }, 60 * 60 * 1000); // Check every hour

          // Listen for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New content available
                }
              });
            }
          });
        })
        .catch((error) => {
          console.warn('⚠️ Service Worker registration failed:', error);
        });
    });
  }
}

export function unregister(): void {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error('Service Worker unregistration failed:', error);
      });
  }
}

export function clearCache(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.ready
        .then((registration) => {
          const messageChannel = new MessageChannel();
          messageChannel.port1.onmessage = (event) => {
            if (event.data.success) {
              resolve();
            } else {
              reject(new Error('Failed to clear cache'));
            }
          };

          registration.active?.postMessage({ type: 'CLEAR_CACHE' }, [messageChannel.port2]);
        })
        .catch(reject);
    } else {
      reject(new Error('Service Worker not supported'));
    }
  });
}

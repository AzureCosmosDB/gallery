/**
 * Root component - Registers service worker for caching
 */

import React, { useEffect } from 'react';

export default function Root({ children }) {
  useEffect(() => {
    // Register service worker for production builds
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      process.env.NODE_ENV === 'production'
    ) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/postgres-gallery/sw.js')
          .then((registration) => {
            console.log('SW registered:', registration);
            
            // Check for updates periodically
            setInterval(() => {
              registration.update();
            }, 60000); // Check every minute
          })
          .catch((error) => {
            console.log('SW registration failed:', error);
          });
      });
    }
  }, []);

  return <>{children}</>;
}

/**
 * Root component - Registers service worker for caching
 */

import React, { useEffect, useState } from 'react';
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';
import GlobalLoader from '@site/src/components/GlobalLoader';

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

  const [isLoading, setIsLoading] = useState(() => {
    return ExecutionEnvironment.canUseDOM;
  });

  // Initialize gtag safety wrapper on client side
  useEffect(() => {
    if (ExecutionEnvironment.canUseDOM && !window.gtag) {
      window.gtag = function () {
        // If gtag is not available yet, queue the calls
        window.gtag.q = window.gtag.q || [];
        window.gtag.q.push(arguments);
      };
    }
  }, []);

  useEffect(() => {
    // Only run on client side
    if (ExecutionEnvironment.canUseDOM) {
      // Show loader for minimum 800ms to ensure smooth experience
      const minLoadTime = 800;
      const startTime = Date.now();

      const handleLoad = () => {
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, minLoadTime - elapsedTime);

        setTimeout(() => {
          setIsLoading(false);
        }, remainingTime);
      };

      // Check if page is already loaded
      if (document.readyState === "complete") {
        handleLoad();
      } else {
        // Wait for window load event
        window.addEventListener("load", handleLoad);

        // Fallback timeout in case load event doesn't fire
        const fallbackTimeout = setTimeout(() => {
          setIsLoading(false);
        }, 3000);

        return () => {
          window.removeEventListener("load", handleLoad);
          clearTimeout(fallbackTimeout);
        };
      }
    }
  }, []);

  if (isLoading) {
    return <GlobalLoader />;
  }

  return <>{children}</>;
}

/**
 * Google Analytics safety wrapper
 * Ensures gtag calls don't fail when GA is not loaded
 */

// Initialize gtag queue if it doesn't exist
if (typeof window !== "undefined" && !window.gtag) {
  window.gtag = function () {
    // If gtag is not available yet, queue the calls
    window.gtag.q = window.gtag.q || [];
    window.gtag.q.push(arguments);
  };
}

export {};

/**
 * Image Preloader Utility
 * Preloads critical above-the-fold images for better perceived performance
 */

export interface PreloadOptions {
  priority?: 'high' | 'low';
  as?: 'image';
  type?: string;
}

/**
 * Preload a single image
 */
export function preloadImage(src: string, options: PreloadOptions = {}): void {
  if (typeof window === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = options.as || 'image';
  link.href = src;
  
  if (options.type) {
    link.type = options.type;
  }
  
  if (options.priority === 'high') {
    link.setAttribute('fetchpriority', 'high');
  }

  document.head.appendChild(link);
}

/**
 * Preload multiple images
 */
export function preloadImages(sources: string[], options: PreloadOptions = {}): void {
  sources.forEach(src => preloadImage(src, options));
}

/**
 * Preload images with WebP support detection
 */
export function preloadImageWithWebP(
  src: string,
  webpSrc: string,
  options: PreloadOptions = {}
): void {
  if (typeof window === 'undefined') return;

  // Check WebP support
  const supportsWebP = document.createElement('canvas')
    .toDataURL('image/webp')
    .indexOf('data:image/webp') === 0;

  const imageToPreload = supportsWebP ? webpSrc : src;
  preloadImage(imageToPreload, { ...options, type: supportsWebP ? 'image/webp' : undefined });
}

/**
 * Preload featured/hero images from user data
 */
export function preloadFeaturedImages(users: any[], limit: number = 6): void {
  if (typeof window === 'undefined') return;

  const featuredImages = users
    .filter(user => user.image)
    .slice(0, limit)
    .map(user => user.image);

  featuredImages.forEach((src, index) => {
    const priority = index < 3 ? 'high' : 'low';
    
    // Try to preload WebP version if available
    const ext = src.substring(src.lastIndexOf('.'));
    if (['.png', '.jpg', '.jpeg'].includes(ext.toLowerCase())) {
      const webpSrc = src.replace(ext, '.webp');
      preloadImageWithWebP(src, webpSrc, { priority: priority as 'high' | 'low' });
    } else {
      preloadImage(src, { priority: priority as 'high' | 'low' });
    }
  });
}

/**
 * Preload critical assets (background images, logos, etc.)
 */
export function preloadCriticalAssets(): void {
  if (typeof window === 'undefined') return;

  const criticalAssets = [
    '/postgres-gallery/img/logo.png',
    '/postgres-gallery/img/dotted-background-opacity40.png',
  ];

  preloadImages(criticalAssets, { priority: 'high' });
}


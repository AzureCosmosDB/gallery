/**
 * Image Preloader Utility
 * Preloads critical above-the-fold images for better perceived performance
 */

import type { User } from '../data/tags';

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
 * Only preloads above-the-fold images with priority hints
 */
export function preloadFeaturedImages(users: User[], limit: number = 3): void {
  if (typeof window === 'undefined') return;

  // Only preload first 3 images that are likely above the fold
  const featuredImages = users
    .filter(user => user.image)
    .slice(0, limit)
    .map(user => user.image);

  featuredImages.forEach((src) => {
    // Build optimized image path
    const baseUrl = '/postgres-gallery/';
    const imagePath = src.startsWith('./') ? src.replace('./', baseUrl) : src;
    
    // Extract filename and extension
    const pathParts = imagePath.split('/');
    const filename = pathParts[pathParts.length - 1];
    const ext = filename.split('.').pop()?.toLowerCase();
    const nameWithoutExt = filename.replace(`.${ext}`, '');
    
    // Skip SVG files
    if (ext === 'svg') return;
    
    // Build optimized path
    const pathWithoutFilename = imagePath.substring(0, imagePath.lastIndexOf('/'));
    const basePath = pathWithoutFilename.replace(/\/img$/, '/img-optimized');
    
    // Preload small WebP version for fast initial display
    const webpSrc = `${basePath}/${nameWithoutExt}-300w.webp`;
    preloadImage(webpSrc, { priority: 'high', type: 'image/webp' });
  });
}

/**
 * Preload critical assets (background images, logos, etc.)
 * Uses optimized images for better performance
 */
export function preloadCriticalAssets(): void {
  if (typeof window === 'undefined') return;

  const criticalAssets = [
    '/postgres-gallery/img-optimized/logo.webp',
    '/postgres-gallery/img-optimized/dotted-background-opacity40.webp',
  ];

  preloadImages(criticalAssets, { priority: 'high', type: 'image/webp' });
}


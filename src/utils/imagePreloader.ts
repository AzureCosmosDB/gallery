/**
 * Image Preloader Utility
 * Preloads critical above-the-fold images for better perceived performance
 */

import type { User } from '../data/tags';

export interface PreloadOptions {
  priority?: 'high' | 'low';
  as?: 'image';
  type?: string;
  // Responsive image preload support
  imageSrcSet?: string;
  imageSizes?: string;
  hrefOverride?: string;
}

/**
 * Preload a single image
 */
export function preloadImage(src: string, options: PreloadOptions = {}): void {
  if (typeof window === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = options.as || 'image';
  link.href = options.hrefOverride || src;
  
  if (options.type) {
    link.type = options.type;
  }

  // If provided, attach responsive image hints so the browser can pick the exact variant
  if (options.imageSrcSet) {
    link.setAttribute('imagesrcset', options.imageSrcSet);
  }
  if (options.imageSizes) {
    link.setAttribute('imagesizes', options.imageSizes);
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

    // Build responsive WebP srcset mirroring OptimizedImage component
    const webpSrcSet = [
      `${basePath}/${nameWithoutExt}-300w.webp 300w`,
      `${basePath}/${nameWithoutExt}-600w.webp 600w`,
      `${basePath}/${nameWithoutExt}-1200w.webp 1200w`,
    ].join(', ');

    const sizes = '(max-width: 600px) 300px, (max-width: 1200px) 600px, 1200px';

    // Pick href candidate based on slot size (from sizes) multiplied by DPR.
    const viewport = window.innerWidth;
    const dpr = window.devicePixelRatio || 1;
    const slotCss = viewport <= 600 ? 300 : viewport <= 1200 ? 600 : 1200; // css px from sizes
    const required = slotCss * dpr; // px width actually needed

    let hrefCandidate = `${basePath}/${nameWithoutExt}-1200w.webp`;
    if (required <= 300) hrefCandidate = `${basePath}/${nameWithoutExt}-300w.webp`;
    else if (required <= 600) hrefCandidate = `${basePath}/${nameWithoutExt}-600w.webp`;

    preloadImage(hrefCandidate, {
      priority: 'high',
      type: 'image/webp',
      imageSrcSet: webpSrcSet,
      imageSizes: sizes,
      hrefOverride: hrefCandidate,
    });
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
  ];

  preloadImages(criticalAssets, { priority: 'high', type: 'image/webp' });
}


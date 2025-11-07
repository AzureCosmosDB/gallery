/**
 * OptimizedImage Component
 * High-performance image component with lazy loading, WebP support, and responsive sizes
 * Optimized for GitHub Pages deployment
 */

import React, { useState, useEffect, useRef } from "react";
import useBaseUrl from "@docusaurus/useBaseUrl";
import styles from "./styles.module.css";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  className?: string;
  style?: React.CSSProperties;
  priority?: boolean; // Load immediately without lazy loading
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
}

/**
 * Generates responsive image sources with WebP and fallback formats
 */
function getImageSources(imagePath: string) {
  // Check if it's already an optimized image path
  if (imagePath.includes("-optimized/")) {
    return { webpSrcSet: "", fallbackSrc: imagePath };
  }

  // Extract filename and extension
  const pathParts = imagePath.split("/");
  const filename = pathParts[pathParts.length - 1];
  const ext = filename.split(".").pop()?.toLowerCase();
  const nameWithoutExt = filename.replace(`.${ext}`, "");

  // SVG files are used as-is
  if (ext === "svg") {
    return { webpSrcSet: "", fallbackSrc: imagePath };
  }

  // Build optimized paths - replace /img/ or img/ with /img-optimized/ or img-optimized/
  const pathWithoutFilename = imagePath.substring(
    0,
    imagePath.lastIndexOf("/")
  );
  // Handle both /img and img (with or without leading slash)
  // Match /img at the end, or img at the start/end, preserving the leading slash if present
  let basePath = pathWithoutFilename;
  if (pathWithoutFilename.endsWith("/img")) {
    basePath = pathWithoutFilename.replace(/\/img$/, "/img-optimized");
  } else if (pathWithoutFilename === "img") {
    basePath = "img-optimized";
  } else {
    // Fallback: try to replace img anywhere in the path
    basePath = pathWithoutFilename.replace(/(^|\/)img(\/|$)/, "$1img-optimized$2");
  }

  // WebP srcset for responsive images (always try all sizes - browser will fallback gracefully)
  const webpSources = [
    `${basePath}/${nameWithoutExt}-300w.webp 300w`,
    `${basePath}/${nameWithoutExt}-600w.webp 600w`,
    `${basePath}/${nameWithoutExt}-1200w.webp 1200w`,
  ];

  const webpSrcSet = webpSources.join(", ");

  // Fallback to optimized original format
  const fallbackSrc = `${basePath}/${filename}`;

  return { webpSrcSet, fallbackSrc };
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  style,
  priority = false,
  objectFit = "cover",
}: OptimizedImageProps): JSX.Element {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLDivElement>(null);

  // Get base URL from Docusaurus - called at top level
  const baseUrl = useBaseUrl("/");
  const fullSrc = src.startsWith("./") ? src.replace("./", baseUrl) : src;

  // Get optimized image sources
  const { webpSrcSet, fallbackSrc } = getImageSources(fullSrc);

  // Pre-compute the fallback URL at top level
  const fallbackUrl = useBaseUrl(fallbackSrc);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || !imgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: "50px", // Start loading 50px before image enters viewport
      }
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const combinedStyle: React.CSSProperties = {
    ...style,
    objectFit,
  };

  return (
    <div
      ref={imgRef}
      className={`${styles.imageContainer} ${className || ""}`}
      style={{ width, height }}
    >
      {/* Blur placeholder while loading */}
      {!isLoaded && (
        <div className={styles.placeholder} style={{ width, height }} />
      )}

      {/* Actual image - only render when in view */}
      {isInView && (
        <picture>
          {/* WebP sources for modern browsers */}
          {webpSrcSet && (
            <source
              type="image/webp"
              srcSet={webpSrcSet}
              sizes="(max-width: 600px) 300px, (max-width: 1200px) 600px, 1200px"
            />
          )}

          {/* Fallback image */}
          <img
            src={fallbackUrl}
            alt={alt}
            className={`${styles.image} ${isLoaded ? styles.loaded : ""}`}
            style={combinedStyle}
            onLoad={handleLoad}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
          />
        </picture>
      )}
    </div>
  );
}

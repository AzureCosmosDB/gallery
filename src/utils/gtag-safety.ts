// Safe initializer for window.gtag to avoid touching `window` at module top-level
export type GtagFunction = ((...args: unknown[]) => void) & { q?: unknown[][] };

declare global {
  interface Window {
    gtag?: (
      command: "set" | "config" | "event" | "consent" | "js",
      target: string | Date,
      params?: {
        [key: string]: unknown;
        page_location?: string;
        page_path?: string | unknown[];
        user_properties?: { [key: string]: unknown };
      }
    ) => void;
  }
}

export function ensureGtag(): void {
  if (typeof window === "undefined") return;
  if (window.gtag) return;

  const queue: unknown[][] = [];
  const gtag = ((...args: unknown[]) => {
    queue.push(args as unknown[]);
  }) as GtagFunction;
  gtag.q = queue;

  window.gtag = gtag;
}

export default ensureGtag;

import React, { useEffect, useState } from "react";
import ExecutionEnvironment from "@docusaurus/ExecutionEnvironment";
import GlobalLoader from "../components/GlobalLoader";
import { ensureGtag } from "../utils/gtag-safety";
// import FloatingFeedbackButton from '@site/src/components/FloatingFeedbackButton';

declare global {
  interface Window {
    gtag?: (
      command: "config" | "set" | "event" | "consent" | "js",
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

type RootProps = {
  children: React.ReactNode;
};

export default function Root({ children }: RootProps): JSX.Element {
  useEffect(() => {
    // Register service worker for production builds
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "production"
    ) {
      const onLoad = () => {
        navigator.serviceWorker
          .register("/postgres-gallery/sw.js")
          .then((registration) => {
            // Check for updates periodically
            setInterval(() => {
              registration.update();
            }, 60_000);
          })
          .catch(() => {
            // registration failed - swallow to avoid breaking site
          });
      };

      window.addEventListener("load", onLoad);

      return () => {
        window.removeEventListener("load", onLoad);
      };
    }
    return undefined;
  }, []);

  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    ensureGtag();
  }, []);

  useEffect(() => {
    if (ExecutionEnvironment.canUseDOM) {
      const minLoadTime = 800;
      const startTime = Date.now();

      const handleLoad = () => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, minLoadTime - elapsed);
        setTimeout(() => setIsLoading(false), remaining);
      };

      if (document.readyState === "complete") {
        handleLoad();
      } else {
        window.addEventListener("load", handleLoad);
        const fallback = window.setTimeout(() => setIsLoading(false), 3_000);
        return () => {
          window.removeEventListener("load", handleLoad);
          clearTimeout(fallback);
        };
      }
    }
    return undefined;
  }, []);

  if (isLoading) return <GlobalLoader />;

  return (
    <>
      {children}
      {/* <FloatingFeedbackButton /> */}
    </>
  );
}

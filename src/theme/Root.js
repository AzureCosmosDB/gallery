import React, { useState, useEffect } from "react";
import GlobalLoader from "../components/GlobalLoader";
import ExecutionEnvironment from "@docusaurus/ExecutionEnvironment";

// Default implementation, that you can customize
export default function Root({ children }) {
  const [isLoading, setIsLoading] = useState(true);

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
    } else {
      // On server side, don't show loader
      setIsLoading(false);
    }
  }, []);

  if (isLoading && ExecutionEnvironment.canUseDOM) {
    return <GlobalLoader />;
  }

  return <>{children}</>;
}

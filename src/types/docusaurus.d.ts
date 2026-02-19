// Type declarations for Docusaurus modules

declare module "@docusaurus/useBaseUrl" {
  function useBaseUrl(url: string): string;
  export default useBaseUrl;
}

declare module "@docusaurus/router" {
  export function useHistory(): unknown;
  export function useLocation<T = unknown>(): Location & {
    state: T;
  };
}

declare module "@docusaurus/theme-common" {
  export function useColorMode(): {
    colorMode: "light" | "dark";
    setColorMode: (mode: "light" | "dark") => void;
  };
}

declare module "@docusaurus/ExecutionEnvironment" {
  const ExecutionEnvironment: {
    canUseDOM: boolean;
  };
  export default ExecutionEnvironment;
}

declare module "@generated/docusaurus.config" {
  const config: {
    customFields: {
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
  export default config;
}

declare module "@docusaurus/useDocusaurusContext" {
  export default function useDocusaurusContext(): {
    siteConfig: unknown;
  };
}

declare module "@theme/Layout" {
  const Layout: React.ComponentType<{
    children: React.ReactNode;
    title?: string;
    description?: string;
  }>;
  export default Layout;
}

// CSS Modules
declare module "*.module.css" {
  const classes: { [key: string]: string };
  export default classes;
}

declare module "*.css" {
  const content: { [key: string]: string };
  export default content;
}

// Google Analytics Global Site Tag (gtag) interface
declare global {
  interface Window {
    gtag?: (
      command: "config" | "set" | "event" | "consent" | "js",
      target: string | Date,
      params?: {
        [key: string]: unknown;
        page_location?: string;
        page_path?: string | unknown[];
        user_properties?: {
          [key: string]: unknown;
        };
      }
    ) => void;
  }
}

export {};

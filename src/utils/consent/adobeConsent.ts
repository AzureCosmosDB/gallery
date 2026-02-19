import { removeElementById, addClickListenerOnce } from "./dom";

type ConsentCategories = {
  Analytics?: boolean;
  SocialMedia?: boolean;
  Advertising?: boolean;
};

type InitOptions = {
  manageCookieLabel: string;
  manageCookieId: string;
  instrumentationKey: string;
};

type WcpConsentSite = {
  isConsentRequired?: boolean;
  manageConsent?: () => void;
  getConsent?: () => ConsentCategories | null;
};

type WcpConsentApi = {
  init?: (
    locale: string,
    elementId: string,
    callback: (error: Error | null, siteConsent: WcpConsentSite | null) => void,
    onConsentChanged: (categoryPreferences: ConsentCategories) => void
  ) => void;
  siteConsent?: WcpConsentSite;
};

type AutoCaptureConfig = {
  scroll: boolean;
  pageView: boolean;
  onLoad: boolean;
  onUnload: boolean;
  click: boolean;
  resize: boolean;
  jsError: boolean;
};

type ApplicationInsightsConfig = {
  instrumentationKey: string;
  propertyConfiguration: {
    callback: {
      userConsentDetails: ConsentCategories | null;
    };
  };
  webAnalyticsConfiguration: {
    autoCapture: AutoCaptureConfig;
  };
  disableTelemetry: boolean;
};

type ApplicationInsightsInstance = {
  initialize: (config: ApplicationInsightsConfig, plugins: unknown[]) => void;
};

type OneDSGlobal = {
  ApplicationInsights?: new () => ApplicationInsightsInstance;
};

declare global {
  interface Window {
    WcpConsent?: WcpConsentApi;
    oneDS?: OneDSGlobal;
  }
}

export function initAdobeConsent({
  manageCookieLabel,
  manageCookieId,
  instrumentationKey,
}: InitOptions): void {
  if (typeof window === "undefined") return;

  const WcpConsent = window.WcpConsent;
  if (!WcpConsent?.init) return;

  const SET = "set";
  const RESET = "reset";

  let siteConsent: WcpConsentSite | null = null;

  const AnalyticsCookies = (_state: string) => {};
  const SocialMediaCookies = (_state: string) => {};
  const AdvertisingCookies = (_state: string) => {};

  const setNonEssentialCookies = (prefs?: ConsentCategories | null) => {
    if (!prefs) return;

    AnalyticsCookies(prefs.Analytics ? SET : RESET);
    SocialMediaCookies(prefs.SocialMedia ? SET : RESET);
    AdvertisingCookies(prefs.Advertising ? SET : RESET);
  };

  const onConsentChanged = (categoryPreferences: ConsentCategories) => {
    setNonEssentialCookies(categoryPreferences);
  };

  try {
    WcpConsent.init?.(
      "en-US",
      "cookie-banner",
      (error, consent) => {
        if (!error && consent) {
          siteConsent = consent;
        }
      },
      onConsentChanged
    );
  } catch {
    return;
  }

  try {
    if (WcpConsent.siteConsent?.isConsentRequired) {
      addClickListenerOnce("manage_cookie", (e) => {
        e.preventDefault();
        WcpConsent.siteConsent?.manageConsent?.();
      });
    } else {
      removeElementById("footer__links_" + manageCookieLabel);
      removeElementById(manageCookieId);
    }

    const consent = WcpConsent.siteConsent?.getConsent?.() ?? null;

    setNonEssentialCookies(consent);

    const oneDS = window.oneDS;
    if (oneDS?.ApplicationInsights) {
      const analytics = new oneDS.ApplicationInsights();
      const analyticsConfig: ApplicationInsightsConfig = {
        instrumentationKey,
        propertyConfiguration: {
          callback: {
            userConsentDetails: siteConsent?.getConsent?.() ?? null,
          },
        },
        webAnalyticsConfiguration: {
          autoCapture: {
            scroll: true,
            pageView: true,
            onLoad: true,
            onUnload: true,
            click: true,
            resize: true,
            jsError: true,
          },
        },
        disableTelemetry: true,
      };
      analytics.initialize(analyticsConfig, []);
    }
  } catch {
    // swallow everything
  }
}

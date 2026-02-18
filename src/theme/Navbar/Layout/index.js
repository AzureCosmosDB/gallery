import React, { useEffect } from "react";
import clsx from "clsx";
import { useThemeConfig } from "@docusaurus/theme-common";
import {
  useHideableNavbar,
  useNavbarMobileSidebar,
} from "@docusaurus/theme-common/internal";
import { translate } from "@docusaurus/Translate";
import NavbarMobileSidebar from "@theme/Navbar/MobileSidebar";
import styles from "./styles.module.css";
import { manageCookieLabel, manageCookieId } from "../../../../constants.js";
function NavbarBackdrop(props) {
  return (
    <div
      role="presentation"
      {...props}
      className={clsx("navbar-sidebar__backdrop", props.className)}
    />
  );
}

function removeItem(id) {
  var getItem = document.getElementById(id);
  if (getItem !== null) {
    getItem.remove();
  } else {
    // element not found - nothing to remove (do not throw during runtime)
    return;
  }
}

const adobeInit = () => {
  // Guard against missing window (SSR) and missing WcpConsent
  if (typeof window === "undefined") return;
  const WcpConsent = window.WcpConsent || null;

  if (!WcpConsent) {
    // Consent manager not present; skip consent and analytics initialization
    return;
  }

  // Adobe Analytics
  // WCP initialization
  const SET = "set";
  const RESET = "reset";
  let siteConsent = null;

  try {
    WcpConsent.init(
      "en-US",
      "cookie-banner",
      function (err, _siteConsent) {
        if (!err) {
          siteConsent = _siteConsent; //siteConsent is used to get the current consent
        } else {
          // Error initializing consent manager
        }
      },
      onConsentChanged
    );
  } catch (err) {
    // WcpConsent init failed
  }

  function onConsentChanged(categoryPreferences) {
    setNonEssentialCookies(categoryPreferences);
  }

  function setNonEssentialCookies(categoryPreferences) {
    if (!categoryPreferences) return;

    if (categoryPreferences.Analytics) {
      AnalyticsCookies(SET);
    } else {
      AnalyticsCookies(RESET);
    }

    if (categoryPreferences.SocialMedia) {
      SocialMediaCookies(SET);
    } else {
      SocialMediaCookies(RESET);
    }

    if (categoryPreferences.Advertising) {
      AdvertisingCookies(SET);
    } else {
      AdvertisingCookies(RESET);
    }
  }

  function AnalyticsCookies(setString) {
    // no-op placeholder
  }

  function SocialMediaCookies(setString) {
    // no-op placeholder
  }

  function AdvertisingCookies(setString) {
    // no-op placeholder
  }

  try {
    if (WcpConsent.siteConsent && WcpConsent.siteConsent.isConsentRequired) {
      var manageCookies = document.getElementById("manage_cookie");
      if (manageCookies) {
        manageCookies.addEventListener("click", function (e) {
          e.preventDefault();
          if (WcpConsent.siteConsent && WcpConsent.siteConsent.manageConsent) {
            WcpConsent.siteConsent.manageConsent();
          }
        });
      }
    } else {
      // remove Manage Cookie and separator in footer if present
      try {
        removeItem("footer__links_" + manageCookieLabel);
        removeItem(manageCookieId);
      } catch (e) {
        // ignore
      }
    }

    const consent =
      WcpConsent.siteConsent && typeof WcpConsent.siteConsent.getConsent === "function"
        ? WcpConsent.siteConsent.getConsent()
        : null;

    setNonEssentialCookies(consent);

    // 1DS initialization
    try {
      if (typeof oneDS !== "undefined" && oneDS && oneDS.ApplicationInsights) {
        const analytics = new oneDS.ApplicationInsights();
        var config = {
          instrumentationKey:
            "08243c72936e46a593d47b154e6c427a-3daf9d0a-e9eb-4525-90de-c6d9c47e6a87-7011",
          propertyConfiguration: {
            // Properties Plugin configuration
            callback: {
              userConsentDetails: siteConsent && typeof siteConsent.getConsent === "function" ? siteConsent.getConsent() : null,
            },
          },
          webAnalyticsConfiguration: {
            // Web Analytics Plugin configuration
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
          disableTelemetry: true, // Disabled telemetry by default, can enable here on need.
        };
        //Initialize SDK
        analytics.initialize(config, []);
      }
    } catch (error) {
        if (
        error instanceof ReferenceError &&
        error.message.includes("oneDS is not defined")
      ) {
        // oneDS not defined (likely ad blocker) - telemetry disabled
      } else {
        // swallow other errors to avoid breaking the site
      }
    }
  } catch (err) {
    // adobeInit runtime error
  }
};

export default function NavbarLayout({ children }) {
  const {
    navbar: { hideOnScroll, style },
  } = useThemeConfig();
  const mobileSidebar = useNavbarMobileSidebar();
  const { navbarRef, isNavbarVisible } = useHideableNavbar(hideOnScroll);

  useEffect(() => {
    adobeInit();
  }, []);

  return (
    <nav
      ref={navbarRef}
      aria-label={translate({
        id: "theme.NavBar.navAriaLabel",
        message: "Main",
        description: "The ARIA label for the main navigation",
      })}
      className={clsx(
        "navbar",
        "navbar--fixed-top",
        hideOnScroll && [
          styles.navbarHideable,
          !isNavbarVisible && styles.navbarHidden,
        ],
        {
          "navbar--primary": style === "primary",
          "navbar-sidebar--show": mobileSidebar.shown,
        }
      )}
    >
      {children}
      <NavbarBackdrop onClick={mobileSidebar.toggle} />
      <NavbarMobileSidebar />
    </nav>
  );
}

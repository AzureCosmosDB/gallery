import { useEffect } from "react";
import { initAdobeConsent } from "../../../utils/consent/adobeConsent";
import { manageCookieLabel, manageCookieId } from "../../../../constants.js";

const INSTRUMENTATION_KEY =
  "08243c72936e46a593d47b154e6c427a-3daf9d0a-e9eb-4525-90de-c6d9c47e6a87-7011";

export function useAdobeConsentInit(): void {
  useEffect(() => {
    initAdobeConsent({
      manageCookieLabel,
      manageCookieId,
      instrumentationKey: INSTRUMENTATION_KEY,
    });
  }, []);
}

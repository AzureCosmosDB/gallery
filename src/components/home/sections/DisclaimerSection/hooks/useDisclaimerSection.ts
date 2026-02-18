import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import { DisclaimerSectionConfig } from "../types";


export function useDisclaimerSection() {
  const { siteConfig } = useDocusaurusContext();

  const disclaimer = siteConfig.customFields?.disclaimerSection as
    | DisclaimerSectionConfig
    | undefined;

  const title = disclaimer?.title?.trim() || "";
  const description = disclaimer?.description?.trim() || "";

  const shouldRender = Boolean(title || description);

  return { siteConfig, title, description, shouldRender };
}

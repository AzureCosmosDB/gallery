import React from "react";
import { useThemeConfig } from "@docusaurus/theme-common";
import FooterLinksSimple from "@theme/Footer/Links/Simple";
import styles from "./Footer.module.css";
import { useDisclaimerSection } from "../../components/home/sections/DisclaimerSection/hooks/useDisclaimerSection";
import { useNavbarLogoSrc } from "../../components/home/sections/DisclaimerSection/utils/logo";

export default function Footer() {
  const { footer } = useThemeConfig();
  const { siteConfig, title, description } = useDisclaimerSection();
  const siteCfg: any = siteConfig;
  const logoSrc = useNavbarLogoSrc(siteCfg?.themeConfig?.navbar?.logo?.src);

  if (!footer) {
    return null;
  }

  return (
    <footer className={styles.footer}>
      <div className={styles.footerLinksContainer}>
        <div className={styles.footerLinksBox}>
          <FooterLinksSimple links={footer.links} />
        </div>
      </div>

      {/* Disclaimer Section */}
      <div className={styles.disclaimerContainer}>
        <div className={styles.disclaimerContent}>
          <div className={styles.titleRow}>
            <img
              src={logoSrc}
              alt={siteCfg?.title || ""}
              className={styles.navbarLogo}
              loading="lazy"
              decoding="async"
            />
            {title ? <span className={styles.title}>{title}</span> : null}
          </div>
          {description ? <div className={styles.description}>{description}</div> : null}
        </div>
      </div>
    </footer>
  );
}

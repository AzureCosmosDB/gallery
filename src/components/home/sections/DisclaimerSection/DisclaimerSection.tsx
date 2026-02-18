import React from "react";
import styles from "./DisclaimerSection.module.css";
import { useDisclaimerSection } from "./hooks/useDisclaimerSection";
import { useNavbarLogoSrc } from "./utils/logo";

export default function DisclaimerSection() {
  const { siteConfig, title, description, shouldRender } = useDisclaimerSection();
  const logoSrc = useNavbarLogoSrc(siteConfig.themeConfig?.navbar?.logo?.src);

  if (!shouldRender) return null;

  return (
    <section className={styles.disclaimerSection}>
      <div className={styles.titleRow}>
        <img
          src={logoSrc}
          alt={siteConfig.title}
          className={styles.navbarLogo}
          loading="lazy"
          decoding="async"
        />
        {title ? <h3 className={styles.title}>{title}</h3> : null}
      </div>

      {description ? (
        <div className={styles.description}>{description}</div>
      ) : null}
    </section>
  );
}

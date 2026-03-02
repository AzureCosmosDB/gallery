import React from "react";
import styles from "./DisclaimerSection.module.css";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import useBaseUrl from "@docusaurus/useBaseUrl";

const DisclaimerSection = () => {
  const { siteConfig } = useDocusaurusContext();
  const disclaimer = siteConfig.customFields.disclaimerSection as {
    title?: string;
    description?: string;
  };
  const title = disclaimer?.title || "";
  const description = disclaimer?.description || "";
  const logoSrc = useBaseUrl(
    siteConfig.themeConfig.navbar.logo?.src || "/img/logo.png"
  );
  return (
    <section className={styles.disclaimerSection}>
      <div className={styles.titleRow}>
        <img
          src={logoSrc}
          alt={siteConfig.title}
          className={styles.navbarLogo}
        />
        <h3 className={styles.title}>{title}</h3>
      </div>
      <div className={styles.description}>{description}</div>
    </section>
  );
};

export default DisclaimerSection;

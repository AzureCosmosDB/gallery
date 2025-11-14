import React from "react";
import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import styles from "./styles.module.css";

export default function LogoWrapper(props) {
  const { siteConfig } = useDocusaurusContext();
  const logoSrc = useBaseUrl(
    siteConfig.themeConfig.navbar.logo?.src || "/img/logo.png"
  );

  return (
    <Link to="/" className={styles.navbarBrandContainer}>
      <img src={logoSrc} alt={siteConfig.title} className={styles.navbarLogo} />
      <div className={styles.navbarTextContainer}>
        <div className={styles.navbarTitle}>{siteConfig.title}</div>
        <div className={styles.navbarSubtitle}>for Azure PostgreSQL</div>
      </div>
    </Link>
  );
}

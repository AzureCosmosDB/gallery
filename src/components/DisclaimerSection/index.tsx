import React from "react";
import styles from "./DisclaimerSection.module.css";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";

const DisclaimerSection = () => {
  const { siteConfig } = useDocusaurusContext();
  const disclaimer = siteConfig.customFields.disclaimerSection as {
    title?: string;
    description?: string;
  };
  const title = disclaimer?.title || "";
  const description = disclaimer?.description || "";
  return (
    <section className={styles.disclaimerSection}>
      <div className={styles.titleRow}>
        <span className={styles.logoAZ}>Az</span>
        <h3 className={styles.title}>{title}</h3>
      </div>
      <div className={styles.description}>{description}</div>
    </section>
  );
};

export default DisclaimerSection;

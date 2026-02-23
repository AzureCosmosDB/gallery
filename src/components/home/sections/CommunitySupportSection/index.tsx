import React from "react";
import styles from "./CommunitySupportSection.module.css";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import type { CommunitySupportSectionType } from "./types";
import { CommunityCard } from "./components/CommunityCard";

const CommunitySupportSection = () => {
  const { siteConfig } = useDocusaurusContext();
  const section = siteConfig.customFields?.communitySupportSection as
    | CommunitySupportSectionType
    | undefined;

  if (!section) return null;

  return (
    <section className={styles.communitySupportSection}>
      <div className={styles.contentWrapper}>
        <h2 className={styles.title}>{section.title}</h2>
        <p className={styles.description}>{section.description}</p>

        <div className={styles.cardsGrid}>
          {section.cards.map((card, idx) => (
            <CommunityCard key={card.id ?? `${card.title}-${idx}`} card={card} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CommunitySupportSection;

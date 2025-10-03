import React from "react";
import styles from "./CommunitySupportSection.module.css";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import * as LucideIcons from "lucide-react";

type CardAction = {
  label: string;
  href: string;
  variant?: string;
  icon?: string;
  fullWidth?: boolean;
};
type CardType = {
  title: string;
  desc: string;
  icon: string;
  iconColor?: string;
  iconBg?: string;
  actions: CardAction[];
};
type SectionType = {
  title: string;
  description: string;
  cards: CardType[];
};

const CommunitySupportSection = () => {
  const { siteConfig } = useDocusaurusContext();
  const section = siteConfig.customFields?.communitySupportSection as
    | SectionType
    | undefined;
  if (!section) return null;
  return (
    <section className={styles.communitySupportSection}>
      <div className={styles.contentWrapper}>
        <h2 className={styles.title}>{section.title}</h2>
        <p className={styles.description}>{section.description}</p>
        <div className={styles.cardsGrid}>
          {section.cards.map((card, idx) => {
            const Icon = (LucideIcons as any)[card.icon] || LucideIcons.Mail;
            return (
              <div className={styles.card} key={idx}>
                <div className={styles.cardHeader}>
                  <span
                    className={styles.iconBg}
                    style={{ background: card.iconBg || "#e6f0fa" }}
                  >
                    <Icon
                      className={styles.cardIcon}
                      size={22}
                      style={{ color: card.iconColor || "#1960fc" }}
                    />
                  </span>
                  <span className={styles.cardTitle}>{card.title}</span>
                </div>
                <div className={styles.cardDesc}>{card.desc}</div>
                <div
                  className={styles.cardActions}
                  style={
                    card.title === "Contact Us"
                      ? { flexDirection: "column", width: "100%", gap: 12 }
                      : {}
                  }
                >
                  {card.actions.map((action, i) => {
                    const ActionIcon = action.icon
                      ? (LucideIcons as any)[action.icon]
                      : null;
                    const isOutlined = action.variant === "outlined";
                    const fullWidth =
                      action.fullWidth || card.title === "Contact Us";
                    return (
                      <a
                        key={i}
                        href={action.href}
                        className={
                          isOutlined
                            ? styles.cardActionBtnOutlined
                            : styles.cardActionBtn
                        }
                        style={
                          fullWidth
                            ? {
                                width: "100%",
                                justifyContent:
                                  card.title === "Contact Us"
                                    ? "flex-start"
                                    : "center",
                              }
                            : {}
                        }
                        target={
                          action.href.startsWith("http") ? "_blank" : undefined
                        }
                        rel={
                          action.href.startsWith("http")
                            ? "noopener noreferrer"
                            : undefined
                        }
                      >
                        {ActionIcon && (
                          <ActionIcon
                            size={18}
                            style={{ marginRight: 10, minWidth: 18 }}
                          />
                        )}
                        {action.label}
                      </a>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CommunitySupportSection;
// ...existing code above (correct function and export)...

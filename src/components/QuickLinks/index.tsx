import React from "react";
import styles from "./QuickLinks.module.css";
import useBaseUrl from "@docusaurus/useBaseUrl";
import { Link } from "@fluentui/react-components";
import * as LucideIcons from "lucide-react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";

const QuickLinks: React.FC = () => {
  const { siteConfig } = useDocusaurusContext();
  const quickLinks = (siteConfig.customFields.quickLinks || []) as Array<{
    icon: string;
    color: string;
    label: string;
    description: string;
    href: string;
  }>;
  return (
    <section className={styles.quickLinksSection}>
      <h2 className={styles.title}>Quick Links</h2>
      <div className={styles.description}>
        Jump straight to the resources you need to accelerate your development
      </div>
      <div className={styles.tilesContainer}>
        {quickLinks.map((link) => {
          const isImageIcon =
            !!link.icon &&
            (link.icon.startsWith("img/") ||
              link.icon.startsWith("/img/") ||
              link.icon.endsWith(".svg") ||
              link.icon.endsWith(".png") ||
              link.icon.endsWith(".jpg") ||
              link.icon.endsWith(".jpeg"));
          const imageSrc = isImageIcon ? useBaseUrl(link.icon) : null;
          const LucideIcon =
            !isImageIcon && (LucideIcons as any)[link.icon]
              ? (LucideIcons as any)[link.icon]
              : LucideIcons["BookOpen"];

          return (
            <Link
              key={link.label}
              href={link.href}
              className={styles.tile}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className={styles.icon}>
                {isImageIcon && imageSrc ? (
                  <img
                    src={imageSrc}
                    alt={link.label}
                    className={styles.iconImg}
                  />
                ) : (
                  (() => {
                    const isEbookIcon =
                      link.icon === "BookOpen" ||
                      (link.label &&
                        link.label.toLowerCase().includes("ebook"));
                    const iconColor = isEbookIcon
                      ? "#D69E29"
                      : link.color || undefined;
                    return <LucideIcon size={32} color={iconColor} />;
                  })()
                )}
              </div>
              <div className={styles.label}>{link.label}</div>
              <div className={styles.tileDescription}>{link.description}</div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default QuickLinks;

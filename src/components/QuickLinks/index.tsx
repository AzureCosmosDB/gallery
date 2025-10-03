import React from "react";
import styles from "./QuickLinks.module.css";
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
      <h2 className={styles.title}>Quick links</h2>
      <div className={styles.description}>
        Jump straight to the resources you need to accelerate your development
      </div>
      <div className={styles.tilesContainer}>
        {quickLinks.map((link) => {
          const LucideIcon = LucideIcons[link.icon] || LucideIcons["BookOpen"];
          return (
            <Link key={link.label} href={link.href} className={styles.tile}>
              <div className={styles.icon}>
                <LucideIcon size={32} color={link.color} />
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

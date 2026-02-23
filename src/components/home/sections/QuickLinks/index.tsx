import React from "react";
import styles from "./QuickLinks.module.css";
import { Link } from "@fluentui/react-components";
import { useQuickLinks } from "./hooks/useQuickLinks";
import { getLucideIcon } from "./utils/icons";
import { isExternal } from "./utils/external";

export default function QuickLinks() {
  const quickLinks = useQuickLinks();

  return (
    <section className={styles.quickLinksSection}>
      <h2 className={styles.title}>Quick Links</h2>
      <div className={styles.description}>
        Jump straight to the resources you need to accelerate your development
      </div>

      <div className={styles.tilesContainer}>
        {quickLinks.map((link) => {
          const Icon = getLucideIcon(link.icon);
          const external = isExternal(link.href);

          return (
            <Link
              key={link.id}
              href={link.href}
              className={styles.tile}
              target={external ? "_blank" : undefined}
              rel={external ? "noopener noreferrer" : undefined}
            >
              <div className={styles.icon} style={link.color ? { color: link.color } : undefined}>
                <Icon size={32} />
              </div>

              <div className={styles.label}>{link.label}</div>
              <div className={styles.tileDescription}>{link.description}</div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

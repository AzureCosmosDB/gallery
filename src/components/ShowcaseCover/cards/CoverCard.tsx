import React from "react";
import styles from "../HeroCover.module.css";

type Props = {
  title: string;
  description?: string;
  icon: React.ReactNode;
  className?: string;
  onClick: () => void;
  children?: React.ReactNode;
};

export function CoverCard({
  title,
  description,
  icon,
  className,
  onClick,
  children,
}: Props) {
  return (
    <button
      type="button"
      className={`${styles.cardCommon} ${className ?? ""}`}
      onClick={onClick}
    >
      <div className={styles.cardIconWrapper}>{icon}</div>
      <span className={styles.cardTitle}>{title}</span>

      {description ? (
        <span className={styles.cardDesc}>{description}</span>
      ) : null}
      {children}
    </button>
  );
}

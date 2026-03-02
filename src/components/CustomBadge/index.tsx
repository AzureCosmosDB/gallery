/**
 * Custom Badge Component - Replaces Fluent UI Badge with full height control
 */

import React from "react";
import styles from "./styles.module.css";
import clsx from "clsx";

export type BadgeColor =
  | "brand"
  | "informative"
  | "success"
  | "warning"
  | "danger"
  | "severe"
  | "subtle";

export type BadgeSize = "small" | "medium" | "large" | "extra-large";

export interface CustomBadgeProps {
  children: React.ReactNode;
  color?: BadgeColor;
  size?: BadgeSize;
  className?: string;
  appearance?: "tint" | "filled" | "outline" | "ghost";
  shape?: "rounded" | "circular" | "square";
  icon?: React.ReactNode;
  iconPosition?: "before" | "after";
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
}

export default function CustomBadge({
  children,
  color = "brand",
  size = "medium",
  className,
  appearance = "tint",
  shape = "circular",
  icon,
  iconPosition = "before",
  onClick,
}: CustomBadgeProps) {
  const badgeClasses = clsx(
    styles.badge,
    styles[`badge_${color}`],
    styles[`badge_${size}`],
    styles[`badge_${appearance}`],
    styles[`badge_${shape}`],
    onClick && styles.badgeClickable,
    className
  );

  const content = (
    <>
      {icon && iconPosition === "before" && (
        <span className={styles.badgeIcon}>{icon}</span>
      )}
      <span className={styles.badgeText}>{children}</span>
      {icon && iconPosition === "after" && (
        <span className={styles.badgeIcon}>{icon}</span>
      )}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        className={badgeClasses}
        onClick={onClick}
        aria-label={typeof children === "string" ? children : undefined}
      >
        {content}
      </button>
    );
  }

  return (
    <span className={badgeClasses}>
      {content}
    </span>
  );
}


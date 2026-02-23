import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import type { QuickLinkItem } from "../types";

export function useQuickLinks(): QuickLinkItem[] {
  const { siteConfig } = useDocusaurusContext();

  const raw = (siteConfig as unknown as Record<string, unknown>).customFields?.["quickLinks"] as
    | unknown[]
    | undefined;

  // fallback
  const entries = raw ?? [];

  // Normalize and protect against missing fields
  return entries.filter(Boolean).map((x, idx) => {
    const obj = x as Record<string, unknown>;
    return {
      id: String(obj.id ?? obj.href ?? obj.label ?? idx),
      icon: String(obj.icon ?? "BookOpen"),
      color: obj.color ? String(obj.color) : undefined,
      label: String(obj.label ?? "Untitled"),
      description: String(obj.description ?? ""),
      href: String(obj.href ?? "#"),
    } as QuickLinkItem;
  });
}

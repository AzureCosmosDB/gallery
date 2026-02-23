import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";

type LucideIconName = keyof typeof LucideIcons;

function normalizeKey(s: string) {
  return s.replace(/[^a-z0-9]/gi, "").toLowerCase();
}

export function getLucideIcon(name?: string, fallback = true): LucideIcon | null {
  const resolver = LucideIcons as unknown as Record<string, unknown>;

  if (!name) {
    return fallback ? (resolver["Mail"] as unknown as LucideIcon) : null;
  }

  // direct lookup
  const direct = resolver[name as LucideIconName];
  if (typeof direct === "function") return direct as LucideIcon;

  // try case-insensitive or punctuation-insensitive match
  const normalized = normalizeKey(name);
  const match = Object.keys(resolver).find((k) => normalizeKey(k) === normalized);
  if (match) return resolver[match] as unknown as LucideIcon;

  return fallback ? (resolver["Mail"] as unknown as LucideIcon) : null;
}

import * as LucideIcons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type LucideIconName = keyof typeof LucideIcons;

function normalizeKey(s: string) {
  return s.replace(/[^a-z0-9]/gi, '').toLowerCase();
}

export function getLucideIcon(name?: string, fallback = true): LucideIcon | null {
  if (!name) return fallback ? (LucideIcons as any).Mail : null;

  // direct lookup
  const direct = (LucideIcons as Record<string, any>)[name as LucideIconName];
  if (typeof direct === 'function') return direct as LucideIcon;

  // try case-insensitive or punctuation-insensitive match
  const normalized = normalizeKey(name);
  const match = Object.keys(LucideIcons).find((k) => normalizeKey(k) === normalized);
  if (match) return (LucideIcons as Record<string, any>)[match] as LucideIcon;

  return fallback ? (LucideIcons as any).Mail : null;
}

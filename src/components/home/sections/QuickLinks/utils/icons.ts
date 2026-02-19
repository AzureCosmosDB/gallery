import * as LucideIcons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type LucideIconName = keyof typeof LucideIcons;

export function getLucideIcon(name?: string): LucideIcon {
  const resolver = LucideIcons as unknown as Record<string, unknown>;

  if (!name) return resolver['BookOpen'] as unknown as LucideIcon;

  const key = name as LucideIconName;
  const Icon = resolver[key];

  return typeof Icon === 'function'
    ? (Icon as unknown as LucideIcon)
    : (resolver['BookOpen'] as unknown as LucideIcon);
}

import * as LucideIcons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type LucideIconName = keyof typeof LucideIcons;

export function getLucideIcon(name?: string): LucideIcon {
  if (!name) return LucideIcons.BookOpen;

  const key = name as LucideIconName;
  const Icon = LucideIcons[key];

  return typeof Icon === 'function' ? (Icon as LucideIcon) : LucideIcons.BookOpen;
}

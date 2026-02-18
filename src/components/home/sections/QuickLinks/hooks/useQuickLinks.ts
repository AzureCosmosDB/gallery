import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import type { QuickLinkItem } from '../types';

export function useQuickLinks(): QuickLinkItem[] {
  const { siteConfig } = useDocusaurusContext();

  const raw = (siteConfig.customFields?.quickLinks ?? []) as any[];

  // Normalize and protect against missing fields
  return raw.filter(Boolean).map((x, idx) => ({
    id: String(x.id ?? x.href ?? x.label ?? idx),
    icon: String(x.icon ?? 'BookOpen'),
    color: x.color ? String(x.color) : undefined,
    label: String(x.label ?? 'Untitled'),
    description: String(x.description ?? ''),
    href: String(x.href ?? '#'),
  }));
}

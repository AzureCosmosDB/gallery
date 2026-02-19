import siteConfig from '@generated/docusaurus.config';
import type { LearningPath } from '../types';

export function getDefaultPathsFromConfig(): LearningPath[] {
  const customFields = siteConfig.customFields as unknown as Record<string, unknown> | undefined;
  const section = customFields?.learningPathsSection as unknown;
  const configPaths = Array.isArray(section)
    ? section
    : (section as unknown as { paths?: unknown } | undefined)?.paths;

  if (!Array.isArray(configPaths)) return [];

  return (configPaths as unknown[])
    .map((p, idx) => {
      const obj = p as Record<string, unknown>;
      return {
        id: String(obj.id ?? obj.filterTag ?? obj.title ?? idx),
        iconName: (obj.icon as string) ?? undefined,
        iconColor: (obj.iconColor as string) ?? undefined,
        title: String(obj.title ?? ''),
        description: String(obj.description ?? ''),
        level: String(obj.level ?? ''),
        duration: String(obj.duration ?? ''),
        tags: Array.isArray(obj.tags) ? (obj.tags as string[]) : [],
        filterTag: String(obj.filterTag ?? obj.filter ?? obj.tag ?? ''),
      } as LearningPath;
    })
    .filter((p) => Boolean(p.filterTag));
}

import siteConfig from "@generated/docusaurus.config";
import type { LearningPath } from "../types";

export function getDefaultPathsFromConfig(): LearningPath[] {
  const section = (siteConfig.customFields as any)?.learningPathsSection;
  const configPaths = section?.paths;

  if (!Array.isArray(configPaths)) return [];

  return configPaths
    .map((p: any, idx: number) => ({
      id: String(p.id ?? p.filterTag ?? p.title ?? idx),
      iconName: p.icon,
      iconColor: p.iconColor,
      title: String(p.title ?? ""),
      description: String(p.description ?? ""),
      level: String(p.level ?? ""),
      duration: String(p.duration ?? ""),
      tags: Array.isArray(p.tags) ? p.tags : [],
      filterTag: String(p.filterTag ?? p.filter ?? p.tag ?? ""),
    }))
    .filter((p: LearningPath) => Boolean(p.filterTag));
}

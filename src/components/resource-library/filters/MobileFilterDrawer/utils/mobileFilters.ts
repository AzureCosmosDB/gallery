import { Tags, type TagType } from "../../../../../data/tags";
import { TagList } from "../../../../../data/users";

export type FilterSectionKey =
  | "learningPaths"
  | "products"
  | "resourceType"
  | "category"
  | "language";

export type FilterSection = {
  key: FilterSectionKey;
  title: string;
  tags: TagType[];
  // determines if section supports nested subtype tags
  supportsSubTypes?: boolean;
};

const RESOURCE_TYPE_EXCLUDE: TagType[] = ["concepts", "how-to", "tutorial"] as TagType[];

export function buildFilterSections(): FilterSection[] {
  const byType = (type: string) => TagList.filter((tag) => Tags[tag]?.type === type);

  return [
    { key: "learningPaths", title: "Learning Pathways", tags: byType("LearningPath") },
    { key: "products", title: "Products", tags: byType("Service"), supportsSubTypes: true },
    {
      key: "resourceType",
      title: "Resource Type",
      tags: byType("ResourceType").filter((t) => !RESOURCE_TYPE_EXCLUDE.includes(t)),
      supportsSubTypes: true,
    },
    { key: "category", title: "Category", tags: byType("ContentType") },
    { key: "language", title: "Language", tags: byType("Language") },
  ];
}

// parent -> children keys (lowercased subtype labels)
export function getSubTagKeys(parent: TagType): TagType[] {
  const tagObject = Tags[parent];
  if (!tagObject?.subType || !Array.isArray(tagObject.subType)) return [];
  return tagObject.subType.map((s) => s.label.toLowerCase() as TagType).filter(Boolean);
}

// toggle tag; if deselecting parent remove its children as well
export function toggleTagWithChildren(selected: TagType[], tag: TagType): TagType[] {
  if (selected.includes(tag)) {
    let next = selected.filter((t) => t !== tag);

    // if parent, remove children too
    const children = getSubTagKeys(tag);
    if (children.length) next = next.filter((t) => !children.includes(t));

    return next;
  }

  return [...selected, tag];
}

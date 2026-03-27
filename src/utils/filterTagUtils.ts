import type { TagType } from "../data/tags";
import { normalizeLabel } from "./jsUtils";

const PARENT_SPECIFIC_SUB_TAGS: Partial<
  Record<TagType, Partial<Record<TagType, TagType>>>
> = {
  fundamentals: {
    overview: "fundamentals-overview",
  },
  genai: {
    overview: "genai-overview",
  },
};

const CONTEXTUAL_SUB_TAG_TO_BASE_TAG: Partial<Record<TagType, TagType>> = {
  "fundamentals-overview": "overview",
  "genai-overview": "overview",
};

export function getSubTagKey(parentTag: TagType, subLabel: string): TagType {
  const normalizedSubTag = normalizeLabel(subLabel) as TagType;

  return PARENT_SPECIFIC_SUB_TAGS[parentTag]?.[normalizedSubTag] ?? normalizedSubTag;
}

export function getBaseTagKey(tag: TagType): TagType {
  return CONTEXTUAL_SUB_TAG_TO_BASE_TAG[tag] ?? tag;
}

export function isContextualSubTag(tag: TagType): boolean {
  return Boolean(CONTEXTUAL_SUB_TAG_TO_BASE_TAG[tag]);
}

export function normalizeSelectedTagKeys(tags: TagType[]): TagType[] {
  const normalizedTags: TagType[] = [];
  const selectedTags = new Set(tags);

  const pushUnique = (tag: TagType) => {
    if (!normalizedTags.includes(tag)) {
      normalizedTags.push(tag);
    }
  };

  tags.forEach((tag) => {
    if (tag !== "overview") {
      pushUnique(tag);
      return;
    }

    let mappedLegacyOverview = false;

    if (selectedTags.has("fundamentals")) {
      pushUnique("fundamentals-overview");
      mappedLegacyOverview = true;
    }

    if (selectedTags.has("genai")) {
      pushUnique("genai-overview");
      mappedLegacyOverview = true;
    }

    if (!mappedLegacyOverview) {
      pushUnique(tag);
    }
  });

  return normalizedTags;
}
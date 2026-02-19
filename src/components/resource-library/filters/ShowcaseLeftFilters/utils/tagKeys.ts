import type { TagType } from "../../../../../data/tags";

// keep the same behavior you have: lowercasing labels
export function toTagKey(label: string): TagType {
  return label.toLowerCase() as TagType;
}

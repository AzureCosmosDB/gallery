/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Tags, type TagType } from '../data/tags';

/**
 * Resource type tag priority order for CTA determination.
 * Tags listed first have higher priority. Blog is always last (secondary to all others).
 * This is the single source of truth for both CTA text and tag display ordering.
 */
export const RESOURCE_TYPE_PRIORITY: TagType[] = [
  'solution-accelerator',
  'workshop',
  'training',
  'video',
  'tutorial',
  'how-to',
  'concepts',
  'documentation',
  'blog',
];

/**
 * Tags that are sub-types of Documentation and should always display
 * "Documentation" as the CTA label rather than their own tag label.
 */
const DOCUMENTATION_SUB_TYPES = new Set<TagType>(['tutorial', 'how-to', 'concepts']);

/**
 * Returns the CTA button text for a card, determined purely by its resource type tags
 * in priority order. Blog is always secondary to every other resource type.
 * tutorial, how-to, and concepts are documentation sub-types and always show "Documentation".
 * Cards with no resource type tags return "More".
 *
 * @param tags - The card's full tag array
 * @param url  - Unused, kept for interface compatibility
 * @returns CTA button text
 */
export function getButtonText(tags: TagType[], _url?: string): string {
  // Walk priority list and return the first tag present on the card
  for (const priorityTag of RESOURCE_TYPE_PRIORITY) {
    if (tags.includes(priorityTag)) {
      // Sub-types of Documentation collapse to the parent CTA label
      if (DOCUMENTATION_SUB_TYPES.has(priorityTag)) return "Documentation";
      return Tags[priorityTag].buttonText ?? priorityTag;
    }
  }

  return "More";
}

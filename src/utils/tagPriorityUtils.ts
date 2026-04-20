/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { TagType } from "../data/tags";
import { RESOURCE_TYPE_PRIORITY } from "./buttonTextUtils";

/**
 * Sorts resource type tags so that the tag matching the card's CTA appears first,
 * followed by the remaining resource type tags in priority order.
 *
 * Since CTA is now determined purely by RESOURCE_TYPE_PRIORITY (highest-priority
 * tag wins), sorting by the same order keeps the displayed tag badge consistent
 * with the CTA button text.
 *
 * @param resourceTypeTags - Array of resource type tag objects to sort
 * @param _buttonText      - Kept for API compatibility; no longer used internally
 * @returns Sorted array with the CTA-relevant tag first
 */
export function sortResourceTypeTagsByCTA(
  resourceTypeTags: Array<{ tag: TagType; [key: string]: any }>,
  _buttonText?: string
): Array<{ tag: TagType; [key: string]: any }> {
  return [...resourceTypeTags].sort((a, b) => {
    const aIdx = RESOURCE_TYPE_PRIORITY.indexOf(a.tag);
    const bIdx = RESOURCE_TYPE_PRIORITY.indexOf(b.tag);

    // Both in priority list → sort by position
    if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;

    // Only one is in the list → that one goes first
    if (aIdx !== -1) return -1;
    if (bIdx !== -1) return 1;

    // Neither is in the list → preserve original order
    return 0;
  });
}

/**
 * Returns the resource type tag priority order.
 * Exported for consumers that need to inspect or test the order directly.
 */
export { RESOURCE_TYPE_PRIORITY };
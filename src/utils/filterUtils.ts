/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 *
 * Filter utilities for user/resource data.
 * Implements AND logic across categories and OR logic within categories,
 * with special handling for parent-child tag relationships.
 */

import { Tags, type User, type TagType } from "../data/tags";

/**
 * Parent-child tag relationships.
 * Children inherit from their parent category for filtering purposes.
 */
export const PARENT_CHILD_MAP: Record<string, string[]> = {
  documentation: ["concepts", "how-to", "tutorial"],
  fundamentals: ["overview", "getting-started"],
  genai: ["overview", "vector", "rag", "agent", "semantic", "graph", "azureai"],
  "app-dev": ["connect", "vscode", "best-practice", "devops"],
  analytics: ["powerbi", "fabric", "adf"],
};

/**
 * Returns the primary category of a tag.
 */
export function getTagCategory(tag: TagType): string {
  const tagObject = Tags[tag];
  if (!tagObject) return "Other";

  const tagType = tagObject.type;
  if (Array.isArray(tagType)) {
    return tagType[0] || "Other";
  }
  return tagType || "Other";
}

/**
 * Builds a child-to-parent map dynamically based on selected tags.
 * Handles children that may belong to multiple parents.
 */
function buildChildToParentMap(selectedTags: TagType[]): Record<string, string> {
  const childToParent: Record<string, string> = {};

  selectedTags.forEach((tag) => {
    if (PARENT_CHILD_MAP[tag]) return; // Skip parents

    for (const [parentKey, children] of Object.entries(PARENT_CHILD_MAP)) {
      if (children.includes(tag)) {
        // Prefer parent that is also selected, otherwise use first match
        if (selectedTags.includes(parentKey as TagType) || !childToParent[tag]) {
          childToParent[tag] = parentKey;
        }
      }
    }
  });

  return childToParent;
}

/**
 * Gets the accordion category for grouping.
 * Sub-tags are grouped with their parent's category.
 */
function getAccordionCategory(tag: TagType, childToParent: Record<string, string>): string {
  const parent = childToParent[tag];
  if (parent) {
    return getTagCategory(parent as TagType);
  }
  return getTagCategory(tag);
}

/**
 * Determines which child tags apply to a specific user for a given parent.
 * Handles cases where children like "overview" belong to multiple parents.
 */
function getActualChildTagsForUser(
  user: User,
  parent: string,
  allChildTags: string[],
): string[] {
  return allChildTags.filter((child) => {
    if (user.tags.includes(parent as TagType)) {
      return true;
    }
    // Exclude children claimed by other parents the user has
    for (const otherParent of Object.keys(PARENT_CHILD_MAP)) {
      if (
        otherParent !== parent &&
        user.tags.includes(otherParent as TagType) &&
        PARENT_CHILD_MAP[otherParent].includes(child)
      ) {
        return false;
      }
    }
    return true;
  });
}

/**
 * Checks if a user matches parent-child filter requirements.
 */
function matchesParentChildFilters(
  user: User,
  selectedParents: Set<string>,
  selectedSubTagsByParent: Map<string, TagType[]>,
): boolean {
  const parentsArray = Array.from(selectedParents);
  for (let i = 0; i < parentsArray.length; i++) {
    const parent = parentsArray[i];
    const subTags = selectedSubTagsByParent.get(parent) || [];
    const allChildTags = PARENT_CHILD_MAP[parent] || [];
    const actualChildTags = getActualChildTagsForUser(user, parent, allChildTags);

    if (subTags.length === 0 || subTags.length === allChildTags.length) {
      // Only parent selected OR all sub-tags selected: match parent OR any child
      const matchesParent = user.tags.includes(parent as TagType);
      const matchesAnyChild = actualChildTags.some((child) =>
        user.tags.includes(child as TagType),
      );
      if (!matchesParent && !matchesAnyChild) {
        return false;
      }
    } else {
      // Some sub-tags selected: match selected sub-tags relevant to this parent
      const relevantSubTags = subTags.filter((subTag) =>
        actualChildTags.includes(subTag),
      );
      if (relevantSubTags.length === 0) {
        return false;
      }
      const matchesSelectedSub = relevantSubTags.some((subTag) =>
        user.tags.includes(subTag),
      );
      if (!matchesSelectedSub) {
        return false;
      }
    }
  }
  return true;
}

/**
 * Checks if a user matches category-based filters (AND across categories, OR within).
 */
function matchesCategoryFilters(
  user: User,
  tagsByCategory: Map<string, TagType[]>,
): boolean {
  const categoryEntries = Array.from(tagsByCategory.entries());
  for (let i = 0; i < categoryEntries.length; i++) {
    const [, categoryTags] = categoryEntries[i];
    const matchesCategory = categoryTags.some((tag) => user.tags.includes(tag));
    if (!matchesCategory) {
      return false;
    }
  }
  return true;
}

/**
 * Filters users based on selected tags and search name.
 *
 * Filter Logic:
 * 1. BETWEEN CATEGORIES (AND): Cards must match ALL category requirements.
 * 2. WITHIN SAME CATEGORY (OR): Cards matching ANY filter in category are shown.
 * 3. PARENT-CHILD: parent AND (child1 OR child2 OR ...) logic.
 */
export function filterUsers(
  users: User[],
  selectedTags: TagType[],
  searchName: string | null,
): User[] {
  // Search filter
  let filteredUsers = users;
  if (searchName) {
    const lowerSearch = searchName.toLowerCase();
    filteredUsers = filteredUsers.filter((user) =>
      user.title.toLowerCase().includes(lowerSearch),
    );
  }

  if (!selectedTags || selectedTags.length === 0) {
    return filteredUsers;
  }

  const childToParent = buildChildToParentMap(selectedTags);

  // Separate parent tags and their selected sub-tags
  const selectedParents = new Set<string>();
  const selectedSubTagsByParent = new Map<string, TagType[]>();

  selectedTags.forEach((tag) => {
    if (PARENT_CHILD_MAP[tag]) {
      selectedParents.add(tag);
    } else if (childToParent[tag]) {
      const parent = childToParent[tag];
      selectedParents.add(parent);
      if (!selectedSubTagsByParent.has(parent)) {
        selectedSubTagsByParent.set(parent, []);
      }
      selectedSubTagsByParent.get(parent)!.push(tag);
    }
  });

  // Group regular (non-parent-child) tags by category
  const tagsByCategory = new Map<string, TagType[]>();
  selectedTags.forEach((tag) => {
    if (PARENT_CHILD_MAP[tag] || childToParent[tag]) {
      return;
    }
    const category = getAccordionCategory(tag, childToParent);
    if (!tagsByCategory.has(category)) {
      tagsByCategory.set(category, []);
    }
    tagsByCategory.get(category)!.push(tag);
  });

  return filteredUsers.filter((user) => {
    if (!user?.tags?.length) {
      return false;
    }
    if (!matchesParentChildFilters(user, selectedParents, selectedSubTagsByParent)) {
      return false;
    }
    if (!matchesCategoryFilters(user, tagsByCategory)) {
      return false;
    }
    return true;
  });
}

/**
 * Computes active tags based on current cards and selected tags.
 * Enables sub-filters when parent is checked and keeps all tags in
 * categories with selections enabled (OR logic).
 */
export function computeActiveTags(
  cards: User[],
  selectedTags: TagType[],
): TagType[] {
  const unionTags = new Set<TagType>();

  // Add all tags from current cards
  cards.forEach((user) => user.tags.forEach((tag) => unionTags.add(tag)));

  // Enable sub-tags when parent is selected
  selectedTags.forEach((selectedTag) => {
    const tagObject = Tags[selectedTag];
    if (tagObject?.subType?.length) {
      tagObject.subType.forEach((sub) => {
        const subTagKey = sub.label.toLowerCase() as TagType;
        if (Tags[subTagKey]) {
          unionTags.add(subTagKey);
        }
      });
    }
  });

  // Keep all tags in categories with selections enabled (OR logic)
  const selectedCategories = new Set<string>();
  selectedTags.forEach((tag) => {
    selectedCategories.add(getTagCategory(tag));
  });

  if (selectedCategories.size > 0) {
    Object.keys(Tags).forEach((tagKey) => {
      const tag = tagKey as TagType;
      const category = getTagCategory(tag);
      if (selectedCategories.has(category)) {
        unionTags.add(tag);
      }
    });
  }

  return Array.from(unionTags);
}

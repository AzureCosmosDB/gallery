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
 *    This includes OR between regular filters and parent-child groups.
 * 3. PARENT-CHILD: parent AND (child1 OR child2 OR ...) logic within each group.
 * 
 * Examples:
 * - ResourceType: blog OR video OR (documentation AND (concepts OR how-to OR tutorial))
 * - ContentType: (fundamentals AND (overview OR getting-started)) OR (genai AND (vector OR rag))
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

  // Group all filters by category (regular filters and parent-child groups together)
  const filtersByCategory = new Map<string, {
    regularTags: TagType[];
    parentChildGroups: Map<string, TagType[]>;
  }>();

  // Process all selected tags
  selectedTags.forEach((tag) => {
    let category: string;
    
    if (PARENT_CHILD_MAP[tag]) {
      // This is a parent tag
      category = getTagCategory(tag);
      if (!filtersByCategory.has(category)) {
        filtersByCategory.set(category, { regularTags: [], parentChildGroups: new Map() });
      }
      filtersByCategory.get(category)!.parentChildGroups.set(tag, []);
      
    } else if (childToParent[tag]) {
      // This is a child tag  
      const parent = childToParent[tag];
      category = getTagCategory(parent as TagType);
      if (!filtersByCategory.has(category)) {
        filtersByCategory.set(category, { regularTags: [], parentChildGroups: new Map() });
      }
      if (!filtersByCategory.get(category)!.parentChildGroups.has(parent)) {
        filtersByCategory.get(category)!.parentChildGroups.set(parent, []);
      }
      filtersByCategory.get(category)!.parentChildGroups.get(parent)!.push(tag);
      
    } else {
      // Regular tag
      category = getTagCategory(tag);
      if (!filtersByCategory.has(category)) {
        filtersByCategory.set(category, { regularTags: [], parentChildGroups: new Map() });
      }
      filtersByCategory.get(category)!.regularTags.push(tag);
    }
  });

  return filteredUsers.filter((user) => {
    if (!user?.tags?.length) {
      return false;
    }

    // AND logic across categories
    for (const [category, filters] of filtersByCategory.entries()) {
      let categoryMatches = false;
      
      // Check regular tags in this category (OR logic)
      if (filters.regularTags.length > 0) {
        categoryMatches = filters.regularTags.some((tag) => user.tags.includes(tag));
      }
      
      // Check parent-child groups in this category (OR logic with regular tags)
      for (const [parent, children] of filters.parentChildGroups.entries()) {
        const allChildTags = PARENT_CHILD_MAP[parent] || [];
        const actualChildTags = getActualChildTagsForUser(user, parent, allChildTags);
        
        let groupMatches = false;
        
        if (children.length === 0 || children.length === allChildTags.length) {
          // Only parent selected OR all children selected: parent OR any child
          groupMatches = user.tags.includes(parent as TagType) || 
                       actualChildTags.some((child) => user.tags.includes(child as TagType));
        } else {
          // Some children selected: parent AND (selected children)
          const relevantChildren = children.filter((child) => actualChildTags.includes(child));
          if (relevantChildren.length > 0) {
            groupMatches = relevantChildren.some((child) => user.tags.includes(child));
          }
        }
        
        if (groupMatches) {
          categoryMatches = true;
          break; // OR logic - one match in category is enough
        }
      }
      
      // If no matches in this category, user fails AND logic
      if (!categoryMatches) {
        return false;
      }
    }
    
    return true;
  });
}

/**
 * Learning path compatible resource types mapping.
 * Only these resource types should be enabled when a learning path is selected.
 */
const LEARNING_PATH_COMPATIBLE_RESOURCES: Record<string, TagType[]> = {
  "developing-core-applications": [
    "documentation", "concepts", "how-to", "tutorial", 
    "workshop", "training", "video", "samples"
  ],
  "building-genai-apps": [
    "documentation", "concepts", "how-to", "tutorial", 
    "solution-accelerator", "training", "video"
  ],
  "building-ai-agents": [
    "documentation", "concepts", "how-to", "tutorial", 
    "solution-accelerator", "training", "video"
  ]
};

/**
 * Learning path tags.
 */
const LEARNING_PATH_TAGS = [
  "developing-core-applications",
  "building-genai-apps", 
  "building-ai-agents"
] as const;

/**
 * Computes active tags based on current cards and selected tags.
 * Enables sub-filters when parent is checked and keeps all tags in
 * categories with selections enabled (OR logic).
 * Special handling for learning paths to maintain compatibility restrictions.
 */
export function computeActiveTags(
  cards: User[],
  selectedTags: TagType[],
): TagType[] {
  const unionTags = new Set<TagType>();

  // Add all tags from current cards
  cards.forEach((user) => user.tags.forEach((tag) => unionTags.add(tag)));

  // Check if any learning path is selected
  const selectedLearningPaths = selectedTags.filter((tag) => 
    LEARNING_PATH_TAGS.includes(tag as any)
  );

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
        // Special handling for ResourceType when learning path is selected
        if (selectedLearningPaths.length > 0 && category === "ResourceType") {
          // Only enable resource types that are compatible with the selected learning path
          const compatibleResources = LEARNING_PATH_COMPATIBLE_RESOURCES[selectedLearningPaths[0]] || [];
          if (compatibleResources.includes(tag)) {
            unionTags.add(tag);
          }
        } else {
          unionTags.add(tag);
        }
      }
    });
  }

  return Array.from(unionTags);
}

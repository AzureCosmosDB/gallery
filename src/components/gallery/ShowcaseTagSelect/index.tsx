/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { useMemo } from "react";
import { useHistory } from "@docusaurus/router";
import { toggleListItem } from "../../../utils/jsUtils";
import { Tags, type TagType } from "../../../data/tags";
import CustomCheckbox from "../CustomCheckbox";
import { getSubTagKey } from "../../../utils/filterTagUtils";

// Helper to get all child tag keys for a parent tag
function getChildTags(parentTag: TagType): TagType[] {
  const parentObj = Tags[parentTag];
  if (parentObj?.subType && Array.isArray(parentObj.subType)) {
    return parentObj.subType.map((s) => getSubTagKey(parentTag, s.label));
  }
  return [];
}

export default function ShowcaseTagSelect({
  label,
  tag,
  id,
  activeTags,
  selectedCheckbox,
  setSelectedCheckbox: _setSelectedCheckbox,
  location,
  readSearchTags,
  replaceSearchTags,
  parentTag,
}: {
  label: string;
  tag: TagType;
  id: string;
  activeTags: TagType[];
  selectedCheckbox: TagType[];
  setSelectedCheckbox: React.Dispatch<React.SetStateAction<TagType[]>>;
  location;
  readSearchTags: (search: string) => TagType[];
  replaceSearchTags: (search: string, newTags: TagType[]) => string;
  parentTag?: TagType; // The parent tag if this is a sub-tag
}): JSX.Element {
  const history = useHistory();

  // Get child tags for this tag (if it's a parent)
  const childTags = useMemo(() => getChildTags(tag), [tag]);
  const hasChildren = childTags.length > 0;
  // updates only the url query
  const toggleTag = () => {
    const tagObject = Tags[tag];
    const isLearningPath = tagObject?.type === "LearningPath";

    if (isLearningPath) {
      // For learning path tags: clear all other filters and set only this tag
      const newSearch = `tags=${tag}`;
      history.replace({
        ...location,
        search: newSearch,
      });

      // Switch to list view for learning paths without scrolling the page
      requestAnimationFrame(() => {
        window.dispatchEvent(new Event("switchToListView"));
      });
    } else {
      // Normal behavior for other tags
      const tags = readSearchTags(location.search);
      let newTags = toggleListItem(tags, tag);

      // Handle parent tag with children - select/deselect all children
      if (hasChildren) {
        const isNowSelected = newTags.includes(tag);
        if (isNowSelected) {
          // Parent is being selected - add all children that belong to this parent
          childTags.forEach((childTag) => {
            if (!newTags.includes(childTag)) {
              newTags = [...newTags, childTag];
            }
          });
        } else {
          // Parent is being deselected - remove only children that belong to this parent
          newTags = newTags.filter((t) => !childTags.includes(t));
        }
      }

      // If this is a sub-tag, handle parent state
      if (parentTag) {
        const parentChildTags = getChildTags(parentTag);
        const isNowSelected = newTags.includes(tag);

        if (isNowSelected) {
          // Child is being selected - ensure parent is also selected AND comes FIRST
          if (!newTags.includes(parentTag)) {
            // Add parent BEFORE all other tags to ensure it comes first in URL
            newTags = [parentTag, ...newTags];
          } else {
            // Parent already exists, ensure it's first
            newTags = [parentTag, ...newTags.filter((t) => t !== parentTag)];
          }
        } else {
          // Child is being deselected - check if any other children of THIS parent are still selected
          const anyChildSelected = parentChildTags.some(
            (childTag) => childTag !== tag && newTags.includes(childTag),
          );
          // If no children of this parent are selected, deselect parent too
          if (!anyChildSelected) {
            newTags = newTags.filter((t) => t !== parentTag);
          }
        }
      }

      const newSearch = replaceSearchTags(location.search, newTags);
      history.replace({
        ...location,
        search: newSearch,
      });
    }
  };
  // Adobe Analytics
  const checkbox = id.replace("showcase_checkbox_id_", "");
  const contentForAdobeAnalytics = `{"id":"${checkbox}","cN":"Tags"}`;

  // Find parent tags that have this tag as a sub-tag
  const parentTags = Object.entries(Tags)
    .filter(([parentKey, parentTag]) => {
      if (parentTag.subType && Array.isArray(parentTag.subType)) {
        // Check if this tag is a child of this parent using our helper function
        const childTags = getChildTags(parentKey as TagType);
        return childTags.includes(tag);
      }
      return false;
    })
    .map(([parentKey]) => parentKey as TagType);

  // Check if any parent tag is selected (in checkbox state or URL)
  const selectedTagsFromUrl = readSearchTags(location.search);
  const isParentSelected = parentTags.some(
    (parentTag) =>
      selectedCheckbox.includes(parentTag) ||
      selectedTagsFromUrl.includes(parentTag),
  );

  // Tags that should always be disabled (no data available)
  const alwaysDisabledTags: TagType[] = [];

  // Enable the sub-tag if:
  // 1. The tag itself is in activeTags, OR
  // 2. Any parent tag is selected (so sub-filters are enabled when parent is checked), OR
  // 3. If this is a sub-tag and its parent is in activeTags
  // BUT always disable tags in alwaysDisabledTags list
  const isDisabled =
    alwaysDisabledTags.includes(tag) ||
    !(
      activeTags?.includes(tag) ||
      isParentSelected ||
      (parentTag && activeTags?.includes(parentTag))
    );

  // Determine checked state:
  // - For parent tags with children: check indeterminate state
  // - For sub-tags: check if selected
  // - For regular tags without children: check if selected
  let checkedState: boolean | "mixed" = false;

  if (hasChildren) {
    // Parent tag with children - determine if all, some, or none are selected
    // Only consider children that belong to THIS parent AND have the parent also selected
    const selectedChildren = childTags.filter((childTag) => {
      const childIsSelected =
        selectedCheckbox.includes(childTag) ||
        selectedTagsFromUrl.includes(childTag);
      const parentIsSelected =
        selectedCheckbox.includes(tag) || selectedTagsFromUrl.includes(tag);

      // Child is only counted as selected if BOTH parent and child are selected
      return childIsSelected && parentIsSelected;
    });

    if (selectedChildren.length === 0) {
      // No children selected
      checkedState = false;
    } else if (selectedChildren.length === childTags.length) {
      // All children selected
      checkedState = true;
    } else {
      // Some children selected - indeterminate state
      checkedState = "mixed";
    }
  } else if (parentTag) {
    // Sub-tag: checked ONLY if BOTH parent AND this child tag are selected
    // This prevents "overview" under different parents from checking each other
    const parentSelected =
      selectedCheckbox.includes(parentTag) ||
      selectedTagsFromUrl.includes(parentTag);
    const childSelected =
      selectedCheckbox.includes(tag) || selectedTagsFromUrl.includes(tag);
    checkedState = parentSelected && childSelected;
  } else {
    // Regular tag without children: checked if selected
    checkedState =
      selectedCheckbox.includes(tag) || selectedTagsFromUrl.includes(tag);
  }

  return (
    <>
      <CustomCheckbox
        id={id}
        data-m={contentForAdobeAnalytics}
        onClick={(e) => {
          // Prevent the click from bubbling to parent accordion header
          e.stopPropagation();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            e.stopPropagation();
            toggleTag();
          }
        }}
        onChange={() => {
          toggleTag();
        }}
        checked={checkedState}
        label={label}
        disabled={isDisabled}
      />
    </>
  );
}

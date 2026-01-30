/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { useCallback, useState, useEffect } from "react";
import { useHistory, useLocation } from "@docusaurus/router";
import { toggleListItem } from "../../../utils/jsUtils";
import { prepareUserState } from "../../../pages/index";
import { Tags, type TagType } from "../../../data/tags";
import { Checkbox } from "@fluentui/react-components";

export default function ShowcaseTagSelect({
  label,
  tag,
  id,
  activeTags,
  selectedCheckbox,
  setSelectedCheckbox,
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
        state: prepareUserState(),
      });

      // Scroll to resource library and switch to list view
      requestAnimationFrame(() => {
        const el = document.getElementById("resource-library");
        if (el) {
          const navbar = document.querySelector(
            ".navbar",
          ) as HTMLElement | null;
          const navbarHeight = navbar ? navbar.offsetHeight : 80;
          const elementPosition =
            el.getBoundingClientRect().top + window.pageYOffset;
          const offsetPosition = elementPosition - navbarHeight - 20;
          window.scrollTo({ top: offsetPosition, behavior: "smooth" });
          // Dispatch custom event to switch to list view for learning paths
          window.dispatchEvent(new Event("switchToListView"));
        }
      });
    } else {
      // Normal behavior for other tags
      const tags = readSearchTags(location.search);
      const wasSelected = tags.includes(tag);
      let newTags = toggleListItem(tags, tag);

      // If this is a sub-tag and its parent is not selected, automatically select the parent
      if (parentTag) {
        const parentSelected = newTags.includes(parentTag);
        const subTagSelected = newTags.includes(tag);

        // If sub-tag is being selected and parent is not selected, add parent
        if (subTagSelected && !parentSelected) {
          newTags = toggleListItem(newTags, parentTag);
        }
      }

      // If a BASE (parent) tag is being deselected, also clear all its sub-filters from URL
      if (!parentTag && wasSelected) {
        const parentObj = Tags[tag];
        if (
          parentObj?.subType &&
          Array.isArray(parentObj.subType) &&
          parentObj.subType.length > 0
        ) {
          const subKeys = parentObj.subType.map(
            (s) => s.label.toLowerCase() as TagType,
          );
          newTags = newTags.filter((t) => !subKeys.includes(t));
        }
      }

      const newSearch = replaceSearchTags(location.search, newTags);
      history.push({
        ...location,
        search: newSearch,
        state: prepareUserState(),
      });
    }
  };
  // Adobe Analytics
  const checkbox = id.replace("showcase_checkbox_id_", "");
  const contentForAdobeAnalytics = `{\"id\":\"${checkbox}\",\"cN\":\"Tags\"}`;

  // Find parent tags that have this tag as a sub-tag
  const parentTags = Object.entries(Tags)
    .filter(([parentKey, parentTag]) => {
      if (parentTag.subType && Array.isArray(parentTag.subType)) {
        const subTagKey = tag.toLowerCase();
        return parentTag.subType.some(
          (sub) => sub.label.toLowerCase() === subTagKey,
        );
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
  const alwaysDisabledTags: TagType[] = ["samples" as TagType];

  // Enable the sub-tag if:
  // 1. The tag itself is in activeTags, OR
  // 2. Any parent tag is selected (so sub-filters are enabled when parent is checked)
  // BUT always disable tags in alwaysDisabledTags list
  const isDisabled = alwaysDisabledTags.includes(tag) || !(activeTags?.includes(tag) || isParentSelected);

  // Determine checked state:
  // - If this is a sub-tag (parentTag provided), only check if BOTH parent and sub-tag are selected
  // - Otherwise, check if the tag is selected
  let isChecked = false;
  if (parentTag) {
    // Sub-tag: only checked if both parent and sub-tag are selected
    const parentSelected =
      selectedCheckbox.includes(parentTag) ||
      selectedTagsFromUrl.includes(parentTag);
    const subTagSelected =
      selectedCheckbox.includes(tag) || selectedTagsFromUrl.includes(tag);
    isChecked = parentSelected && subTagSelected;
  } else {
    // Regular tag: checked if selected
    isChecked =
      selectedCheckbox.includes(tag) || selectedTagsFromUrl.includes(tag);
  }

  return (
    <>
      <Checkbox
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
        checked={isChecked}
        label={label}
        disabled={isDisabled}
      />
    </>
  );
}

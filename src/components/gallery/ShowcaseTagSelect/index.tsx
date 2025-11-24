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
          el.scrollIntoView({ behavior: "smooth" });
          // Dispatch custom event to switch to list view
          window.dispatchEvent(new Event("switchToListView"));
        }
      });
    } else {
      // Normal behavior for other tags
      const tags = readSearchTags(location.search);
      const newTags = toggleListItem(tags, tag);
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

  const toggleCheck = (tag: TagType) => {
    if (selectedCheckbox.includes(tag)) {
      setSelectedCheckbox(selectedCheckbox.filter((item) => item !== tag));
    } else {
      setSelectedCheckbox([...selectedCheckbox, tag]);
    }
  };

  // Find parent tags that have this tag as a sub-tag
  const parentTags = Object.entries(Tags)
    .filter(([parentKey, parentTag]) => {
      if (parentTag.subType && Array.isArray(parentTag.subType)) {
        const subTagKey = tag.toLowerCase();
        return parentTag.subType.some((sub) => sub.label.toLowerCase() === subTagKey);
      }
      return false;
    })
    .map(([parentKey]) => parentKey as TagType);

  // Check if any parent tag is selected (in checkbox state or URL)
  const selectedTagsFromUrl = readSearchTags(location.search);
  const isParentSelected = parentTags.some((parentTag) =>
    selectedCheckbox.includes(parentTag) || selectedTagsFromUrl.includes(parentTag)
  );

  // Enable the sub-tag if:
  // 1. The tag itself is in activeTags, OR
  // 2. Any parent tag is selected (so sub-filters are enabled when parent is checked)
  const isDisabled = !(activeTags?.includes(tag) || isParentSelected);

  return (
    <>
      <Checkbox
        id={id}
        data-m={contentForAdobeAnalytics}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            toggleTag();
            toggleCheck(tag);
          }
        }}
        onChange={() => {
          toggleTag();
          toggleCheck(tag);
        }}
        checked={selectedCheckbox.includes(tag)}
        label={label}
        disabled={isDisabled}
      />
    </>
  );
}

/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 *
 * FilterAppliedBar - Displays active filter badges with remove functionality.
 */

import React from "react";
import { useHistory } from "@docusaurus/router";
import { Badge, Body1 } from "@fluentui/react-components";
import { Dismiss20Filled } from "@fluentui/react-icons";
import { Tags, type TagType } from "../../../data/tags";
import { toggleListItem } from "../../../utils/jsUtils";
import { prepareUserState } from "../../../pages/index";
import styles from "../../../pages/styles.module.css";

export interface FilterAppliedBarProps {
  /** Currently selected tags */
  selectedTags: TagType[];
  /** Callback to clear all filters */
  onClearAll: () => void;
  /** Function to read tags from search string */
  readSearchTags: (search: string) => TagType[];
  /** Function to replace tags in search string */
  replaceSearchTags: (search: string, newTags: TagType[]) => string;
}

/**
 * Removes a tag and its sub-filters when deselecting a parent tag.
 */
function removeTagWithSubFilters(
  tag: TagType,
  currentTags: TagType[],
): TagType[] {
  let newTags = toggleListItem(currentTags, tag);

  const tagObject = Tags[tag];
  if (tagObject?.subType?.length) {
    const subKeys = tagObject.subType.map(
      (s) => s.label.toLowerCase() as TagType,
    );
    newTags = newTags.filter((t) => !subKeys.includes(t));
  }

  return newTags;
}

/**
 * Displays applied filter badges with click-to-remove functionality.
 */
export default function FilterAppliedBar({
  selectedTags,
  onClearAll,
  readSearchTags,
  replaceSearchTags,
}: FilterAppliedBarProps): React.JSX.Element | null {
  const history = useHistory();

  const handleRemoveTag = (tag: TagType) => {
    const currentTags = readSearchTags(location.search);
    const wasSelected = currentTags.includes(tag);

    if (!wasSelected) return;

    const newTags = removeTagWithSubFilters(tag, currentTags);
    const newSearch = replaceSearchTags(location.search, newTags);

    // Track in analytics if available
    if (typeof window.gtag === "function") {
      window.gtag("set", "user_properties", {
        page_location: window.location.href,
        page_path: newTags,
      });
    }

    history.push({
      ...location,
      search: newSearch,
      state: prepareUserState(),
    });
  };

  if (!selectedTags?.length) {
    return null;
  }

  return (
    <div className={styles.filterAppliedBar}>
      <Body1>Filters applied:</Body1>
      {selectedTags.map((tag) => {
        const tagObject = Tags[tag];

        // Safety check: skip if tag doesn't exist
        if (!tagObject) {
          return null;
        }

        return (
          <Badge
            key={tag}
            appearance="filled"
            size="extra-large"
            color="brand"
            shape="circular"
            icon={<Dismiss20Filled />}
            iconPosition="after"
            onClick={() => handleRemoveTag(tag)}
          >
            {tagObject.label}
          </Badge>
        );
      })}
      <div className={styles.clearAll} onClick={onClearAll}>
        Clear all
      </div>
    </div>
  );
}

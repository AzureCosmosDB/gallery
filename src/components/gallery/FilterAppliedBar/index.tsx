/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 *
 * FilterAppliedBar - Displays active filter badges with remove functionality.
 */

import React, { useRef, useState, useEffect } from "react";
import { useHistory } from "@docusaurus/router";
import { Badge, Body1 } from "@fluentui/react-components";
import {
  Dismiss20Filled,
  ChevronLeft20Filled,
  ChevronRight20Filled,
} from "@fluentui/react-icons";
import { Tags, type TagType } from "../../../data/tags";
import { toggleListItem } from "../../../utils/jsUtils";
import {
  getSubTagKey,
  isContextualSubTag,
} from "../../../utils/filterTagUtils";
import { prepareUserState } from "../../../pages/index";
import styles from "../../../pages/styles.module.css";

interface FilterAppliedBarProps {
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
    const subKeys = tagObject.subType.map((s) => getSubTagKey(tag, s.label));
    newTags = newTags.filter((t) => !subKeys.includes(t));
  }

  // If we removed a child tag, and its parent remains but none of the parent's
  // children are selected anymore, also remove the parent from the applied list.
  // Build reverse mapping (child -> parent) and perform cleanup.
  const parentMap: Record<string, string[]> = {};
  Object.keys(Tags).forEach((parentKey) => {
    const parentObj = Tags[parentKey as TagType];
    if (parentObj?.subType && Array.isArray(parentObj.subType)) {
      parentObj.subType.forEach((s) => {
        const childKey = getSubTagKey(parentKey as TagType, s.label);
        parentMap[childKey] ??= [];
        parentMap[childKey].push(parentKey);
      });
    }
  });

  // For each parent of the toggled tag, if the parent is still present but
  // none of its children remain selected, remove the parent as well.
  const toggledKey = tag as string;
  const parents = parentMap[toggledKey] || [];
  parents.forEach((parentKey) => {
    const parentObj = Tags[parentKey as TagType];
    if (!parentObj || !parentObj.subType) return;

    const childKeys = parentObj.subType.map((s) =>
      getSubTagKey(parentKey as TagType, s.label),
    );

    const anyChildSelected = childKeys.some((ck) => newTags.includes(ck));
    if (!anyChildSelected && newTags.includes(parentKey as TagType)) {
      newTags = newTags.filter((t) => t !== (parentKey as TagType));
    }
  });

  // Legacy plain "overview" can still arrive from older URLs. If it is removed,
  // drop any selected parent that no longer has a child represented in the tag state.
  if (tag === "overview" && !isContextualSubTag(tag)) {
    Object.keys(Tags).forEach((parentKey) => {
      const parentObj = Tags[parentKey as TagType];
      if (!parentObj?.subType?.length) return;

      const childKeys = parentObj.subType.map((s) =>
        getSubTagKey(parentKey as TagType, s.label),
      );

      const anyChildSelected = childKeys.some((childKey) =>
        newTags.includes(childKey),
      );

      if (!anyChildSelected && newTags.includes(parentKey as TagType)) {
        newTags = newTags.filter((selectedTag) => selectedTag !== parentKey);
      }
    });
  }

  return newTags;
}

/**
 * Displays applied filter badges with click-to-remove functionality and horizontal scrolling.
 */
export default function FilterAppliedBar({
  selectedTags,
  onClearAll,
  readSearchTags,
  replaceSearchTags,
}: FilterAppliedBarProps): React.JSX.Element | null {
  const history = useHistory();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [showScrollControls, setShowScrollControls] = useState(false);

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

    history.replace({
      ...location,
      search: newSearch,
    });
  };

  const updateScrollButtons = () => {
    if (!scrollContainerRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 1); // Small threshold for precision
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1); // Small threshold for precision
    setShowScrollControls(scrollWidth > clientWidth);
  };

  const scrollTo = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;

    const scrollAmount = 200; // px to scroll
    const currentScroll = scrollContainerRef.current.scrollLeft;
    const targetScroll =
      direction === "left"
        ? currentScroll - scrollAmount
        : currentScroll + scrollAmount;

    scrollContainerRef.current.scrollTo({
      left: targetScroll,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    updateScrollButtons();
    scrollContainer.addEventListener("scroll", updateScrollButtons);
    window.addEventListener("resize", updateScrollButtons);

    return () => {
      scrollContainer.removeEventListener("scroll", updateScrollButtons);
      window.removeEventListener("resize", updateScrollButtons);
    };
  }, [selectedTags]);

  if (!selectedTags?.length) {
    return null;
  }

  return (
    <div className={styles.filterAppliedBarContainer}>
      <div className={styles.filterAppliedBar}>
        <Body1 className={styles.filtersLabel}>Filters applied:</Body1>

        <div className={styles.scrollableFilterContainer}>
          {showScrollControls && canScrollLeft && (
            <>
              <div className={styles.scrollGradientLeft}></div>
              <div
                className={`${styles.scrollButton} ${styles.scrollButtonLeft}`}
                onClick={() => scrollTo("left")}
                aria-label="Scroll filters left"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    scrollTo("left");
                  }
                }}
              >
                <ChevronLeft20Filled />
              </div>
            </>
          )}

          <div
            ref={scrollContainerRef}
            className={styles.filterScrollContainer}
          >
            <div className={styles.filterBadges}>
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
                    className={styles.filterBadge}
                  >
                    {tagObject.label}
                  </Badge>
                );
              })}
              <div className={styles.clearAll} onClick={onClearAll}>
                Clear all
              </div>
            </div>
          </div>

          {showScrollControls && canScrollRight && (
            <>
              <div className={styles.scrollGradientRight}></div>
              <div
                className={`${styles.scrollButton} ${styles.scrollButtonRight}`}
                onClick={() => scrollTo("right")}
                aria-label="Scroll filters right"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    scrollTo("right");
                  }
                }}
              >
                <ChevronRight20Filled />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

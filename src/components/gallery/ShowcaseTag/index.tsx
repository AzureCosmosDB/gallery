/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { useState, useEffect, useRef } from "react";
import styles from "./styles.module.css";
import { Tags, type TagType } from "../../../data/tags-copy";
import { TagList } from "../../../data/users";
import { sortBy } from "../../../utils/jsUtils";
import { Badge, Tooltip } from "@fluentui/react-components";

export default function ShowcaseCardTag({
  tags,
  cardPanel,
}: {
  tags: TagType[];
  cardPanel: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleTagsCount, setVisibleTagsCount] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  const tagObjects = tags
    .filter((tagObject) => tagObject != "featured")
    .map((tag) => ({ tag, ...Tags[tag] }));
  const tagObjectsSorted = sortBy(tagObjects, (tagObject) =>
    TagList.indexOf(tagObject.tag)
  );
  // TODO Modify once filter tags are up to date
  const languageTags = tagObjectsSorted.filter(
    (tag) => tag.type === "Language"
  );
  const modelTags = tagObjectsSorted.filter((tag) => tag.type === "Model");
  const intelligentSolutionTags = tagObjectsSorted.filter(
    (tag) => tag.type === "GenerativeAI"
  );
  const azureTags = tagObjectsSorted.filter((tag) => tag.type === "Azure");
  const resourceTypeTags = tagObjectsSorted.filter(
    (tag) => tag.type === "ResourceType"
  );
  const contentTypeTags = tagObjectsSorted.filter(
    (tag) => tag.type === "ContentType"
  );
  const serviceTags = tagObjectsSorted.filter((tag) => tag.type === "Service");
  const learningPathTags = tagObjectsSorted.filter(
    (tag) => tag.type === "LearningPath"
  );
  const tagsByTypeSorted = [
    ...languageTags,
    ...modelTags,
    ...intelligentSolutionTags,
    ...azureTags,
    ...resourceTypeTags,
    ...contentTypeTags,
    ...serviceTags,
    ...learningPathTags,
  ];

  // Calculate visible tags based on actual container width
  useEffect(() => {
    if (!containerRef.current || cardPanel) return;

    const calculateVisibleTags = () => {
      const container = containerRef.current;
      if (!container) return;

      const containerWidth = container.offsetWidth;
      setContainerWidth(containerWidth);

      // Estimate tag widths (approximate calculation)
      // Each character is roughly 7px, plus padding (16px) and margin (4px)
      const moreTagWidth = 80; // Approximate width of "+X more" badge
      let totalWidth = 0;
      let count = 0;

      for (let i = 0; i < tagsByTypeSorted.length; i++) {
        const tagWidth = tagsByTypeSorted[i].label.length * 7 + 20; // 7px per char + 20px padding/margin

        // Check if adding this tag would exceed available space
        // Reserve space for "+X more" if there are remaining tags
        const remainingTags = tagsByTypeSorted.length - i - 1;
        const needsMoreTag = remainingTags > 0;
        const requiredWidth =
          totalWidth + tagWidth + (needsMoreTag ? moreTagWidth : 0);

        if (requiredWidth > containerWidth - 10) {
          // 10px buffer
          break;
        }

        totalWidth += tagWidth;
        count++;
      }

      setVisibleTagsCount(count);
    };

    calculateVisibleTags();

    // Recalculate on window resize
    const handleResize = () => {
      setTimeout(calculateVisibleTags, 100);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [tagsByTypeSorted, cardPanel]);

  const length = tagObjectsSorted.length;

  // Remove the old character-based calculation logic
  const moreTagDetailList = tagsByTypeSorted
    .map((tagObject) => tagObject.tag)
    .join("\n");

  if (!cardPanel) {
    // Use the calculated visible tags count instead of character-based calculation
    const shownTags = tagsByTypeSorted.slice(0, visibleTagsCount);
    const restCount = tagsByTypeSorted.length - visibleTagsCount;
    const moreTagDetailList = tagsByTypeSorted
      .slice(visibleTagsCount)
      .map((tagObject) => tagObject.tag)
      .join("\n");

    return (
      <div ref={containerRef} className={styles.tagContainer}>
        {shownTags.map((tagObject, index) => {
          const key = `showcase_card_tag_${tagObject.tag}`;
          return (
            <Badge
              appearance="tint"
              size="medium"
              color="brand"
              key={key}
              className={styles.cardTag}
            >
              {tagObject.label}
            </Badge>
          );
        })}
        {restCount > 0 && (
          <Tooltip
            withArrow
            content={{
              children: (
                <span style={{ whiteSpace: "pre-line" }}>
                  {moreTagDetailList}
                </span>
              ),
            }}
            relationship="label"
            key="showcase_card_tag_more"
          >
            <Badge
              appearance="tint"
              size="medium"
              color="brand"
              className={styles.cardTag}
            >
              +{restCount} more
            </Badge>
          </Tooltip>
        )}
      </div>
    );
  } else {
    return (
      <>
        {tagsByTypeSorted.map((tagObject, index) => {
          const id = `showcase_card_tag_${tagObject.tag}`;
          return (
            <div key={index} id={id} className={styles.cardPanelTag}>
              {tagObject.label}
            </div>
          );
        })}
      </>
    );
  }
}

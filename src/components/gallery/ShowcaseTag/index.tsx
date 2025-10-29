/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { useState, useEffect, useRef } from "react";
import styles from "./styles.module.css";
import { Tags, type TagType } from "../../../data/tags";
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

      // Get the measured width but use it more reliably
      let containerWidth = container.offsetWidth;

      // If width seems unreasonably small or large, use a fallback
      // 275px is actually a valid card width, so adjust the range
      if (containerWidth < 200 || containerWidth > 400) {
        // Fallback to expected card width
        containerWidth = 308;
        console.log("Using fallback width:", containerWidth);
      } else {
        console.log("Measured containerWidth:", containerWidth);
      }

      setContainerWidth(containerWidth);

      // Estimate tag widths (approximate calculation)
      // Each character is roughly 7px, plus padding (16px) and margin (4px)
      const moreTagWidth = 80; // Approximate width of "+X more" badge
      let totalWidth = 0;
      let count = 0;

      for (let i = 0; i < tagsByTypeSorted.length; i++) {
        const tagWidth = tagsByTypeSorted[i].label.length * 7 + 20; // 7px per char + 20px padding/margin
        const remainingTags = tagsByTypeSorted.length - i - 1;

        // Calculate required width for this iteration
        let requiredWidth = totalWidth + tagWidth;

        // Only add "+X more" space if there are remaining tags AND we would need to show it
        if (remainingTags > 0) {
          // Check if adding this tag would leave remaining tags
          const potentialTotalWidth = totalWidth + tagWidth;

          // If adding this tag leaves remaining tags, we need space for "+X more"
          requiredWidth = potentialTotalWidth + moreTagWidth;
        }

        // Use a smaller buffer (10px instead of 20px) and ensure at least one tag shows
        const availableWidth = containerWidth - 10;

        if (requiredWidth > availableWidth) {
          // Special case: if no tags have been added yet, force at least one tag
          if (count === 0 && tagWidth < availableWidth) {
            totalWidth += tagWidth;
            count++;
          }
          break;
        }

        totalWidth += tagWidth;
        count++;
      }

      setVisibleTagsCount(count);
    };

    // Use requestAnimationFrame to ensure layout is complete
    const scheduledCalculation = () => {
      requestAnimationFrame(() => {
        setTimeout(calculateVisibleTags, 50);
      });
    };

    // Initial calculation
    scheduledCalculation();

    // Recalculate on window resize with debouncing
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        requestAnimationFrame(calculateVisibleTags);
      }, 150);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimeout);
    };
  }, [tagsByTypeSorted, cardPanel]);

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
          // Map our custom colors to Fluent UI Badge colors
          const getFluentColor = (customColor: string) => {
            switch (customColor) {
              case "blue":
                return "informative";
              case "green":
                return "success";
              case "grey":
                return "subtle";
              case "slate":
                return "subtle";
              case "purple":
                return "brand";
              case "orange":
                return "warning";
              case "brown":
                return "severe";
              case "mustard":
                return "warning";
              case "red":
                return "danger";
              case "teal":
                return "informative";
              case "indigo":
                return "brand";
              default:
                return "brand";
            }
          };

          return (
            <Badge
              appearance="tint"
              size="medium"
              color={getFluentColor(tagObject.color || "brand")}
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
              color="subtle"
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

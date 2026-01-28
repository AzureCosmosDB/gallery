/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { useRef } from "react";
import styles from "./styles.module.css";
import { Tags, type TagType } from "../../../data/tags";
import { TagList } from "../../../data/users";
import { sortBy } from "../../../utils/jsUtils";
import { Tooltip } from "@fluentui/react-components";
import CustomBadge from "../../CustomBadge";

export default function ShowcaseCardTag({
  tags,
  cardPanel,
}: {
  tags: TagType[];
  cardPanel: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Standard: Always show exactly 3 badges before the plus badge
  const MAX_VISIBLE_TAGS = 3;

  const tagObjects = tags
    .filter((tagObject) => tagObject != "featured")
    .map((tag) => ({ tag, ...Tags[tag] }));

  const tagObjectsSorted = sortBy(tagObjects, (tagObject) =>
    TagList.indexOf(tagObject.tag),
  );

  const languageTags = tagObjectsSorted.filter(
    (tag) => tag.type === "Language",
  );

  const modelTags = tagObjectsSorted.filter((tag) => tag.type === "Model");

  const intelligentSolutionTags = tagObjectsSorted.filter(
    (tag) => tag.type === "GenerativeAI",
  );

  const azureTags = tagObjectsSorted.filter((tag) => tag.type === "Azure");

  const resourceTypeTags = tagObjectsSorted.filter(
    (tag) => tag.type === "ResourceType",
  );

  // Filter out resource types that will be shown in the overlay, but keep documentation sub-types
  // since only the main "documentation" tag appears in the overlay
  const processedResourceTypeTags = resourceTypeTags.filter((tag) => {
    // Keep documentation sub-types (concepts, how-to, tutorial) as they won't be in overlay
    if (["concepts", "how-to", "tutorial"].includes(tag.tag)) {
      return true;
    }
    // Remove main resource types as they will appear in the overlay
    return false;
  });

  // Sort documentation sub-types by priority if they exist
  const prioritySubTags = ["how-to", "tutorial", "concepts"];
  processedResourceTypeTags.sort((a, b) => {
    const aIndex = prioritySubTags.indexOf(a.tag);
    const bIndex = prioritySubTags.indexOf(b.tag);
    if (aIndex === -1 && bIndex === -1) return 0;
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

  const contentTypeTags = tagObjectsSorted.filter(
    (tag) => tag.type === "ContentType",
  );

  const serviceTags = tagObjectsSorted.filter((tag) => tag.type === "Service");

  const learningPathTags = tagObjectsSorted.filter(
    (tag) => tag.type === "LearningPath",
  );

  // Order: Resource type → Category → Products → Language
  const tagsByTypeSorted = [
    ...processedResourceTypeTags, // Resource type
    ...contentTypeTags, // Category
    ...intelligentSolutionTags, // Category (GenerativeAI)
    ...azureTags, // Products
    ...serviceTags, // Products  
    ...languageTags, // Language
    ...modelTags,
    ...learningPathTags,
  ];

  // Ensure critical tags like "how-to" are prioritized in display
  const priorityTags = ["how-to", "tutorial", "concepts"];
  const prioritizedTags = [];
  const remainingTags = [];

  tagsByTypeSorted.forEach((tag) => {
    if (priorityTags.includes(tag.tag)) {
      prioritizedTags.push(tag);
    } else {
      remainingTags.push(tag);
    }
  });

  const finalTagsOrder = [...prioritizedTags, ...remainingTags];

  if (!cardPanel) {
    // Standard: Show prioritized tags first, then show "+X more" for the rest
    const shownTags = finalTagsOrder.slice(0, MAX_VISIBLE_TAGS);
    const restCount = finalTagsOrder.length - MAX_VISIBLE_TAGS;
    const hiddenTags = finalTagsOrder.slice(MAX_VISIBLE_TAGS);

    return (
      <div ref={containerRef} className={styles.tagContainer}>
        {shownTags.map((tagObject, index) => {
          const key = `showcase_card_tag_${tagObject.tag}`;

          return (
            <CustomBadge
              appearance="tint"
              size="medium"
              color="subtle"
              key={key}
              className={styles.cardTag}
            >
              {tagObject.label}
            </CustomBadge>
          );
        })}
        {restCount > 0 && (
          <Tooltip
            withArrow
            content={
              <div className={styles.tooltipContent}>
                {hiddenTags.map((tagObject, idx) => (
                  <div key={idx} className={styles.tooltipTag}>
                    {tagObject.label}
                  </div>
                ))}
              </div>
            }
            relationship="label"
            key="showcase_card_tag_more"
          >
            <div
              className={styles.moreBadgeWrapper}
              style={{ display: "inline-block", cursor: "pointer" }}
            >
              <CustomBadge
                appearance="tint"
                size="medium"
                color="subtle"
                className={`${styles.cardTag} ${styles.moreBadge}`}
              >
                +{restCount} more
              </CustomBadge>
            </div>
          </Tooltip>
        )}
      </div>
    );
  } else {
    return (
      <div className={styles.tagContainer}>
        {finalTagsOrder.map((tagObject, index) => {
          const id = `showcase_card_tag_${tagObject.tag}`;
          return (
            <CustomBadge
              appearance="tint"
              size="medium"
              color="subtle"
              key={index}
              className={styles.cardPanelColoredTag}
            >
              {tagObject.label}
            </CustomBadge>
          );
        })}
      </div>
    );
  }
}

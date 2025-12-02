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

  if (!cardPanel) {
    // Standard: Always show exactly 3 badges, then show "+X more" for the rest
    const shownTags = tagsByTypeSorted.slice(0, MAX_VISIBLE_TAGS);
    const restCount = tagsByTypeSorted.length - MAX_VISIBLE_TAGS;
    const hiddenTags = tagsByTypeSorted.slice(MAX_VISIBLE_TAGS);

    return (
      <div ref={containerRef} className={styles.tagContainer}>
        {shownTags.map((tagObject, index) => {
          const key = `showcase_card_tag_${tagObject.tag}`;

          return (
            <CustomBadge
              appearance="tint"
              size="medium"
              color="informative"
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
        {tagsByTypeSorted.map((tagObject, index) => {
          const id = `showcase_card_tag_${tagObject.tag}`;
          return (
            <CustomBadge
              appearance="tint"
              size="medium"
              color="informative"
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

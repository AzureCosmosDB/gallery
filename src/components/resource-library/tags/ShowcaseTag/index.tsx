/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { useRef } from 'react';
import styles from './styles.module.css';
import { Tags, type TagType } from '../../../../data/tags';
import { TagList } from '../../../../data/users';
import { sortBy } from '../../../../utils/jsUtils';
import { Tooltip } from '@fluentui/react-components';
import CustomBadge from '../../../CustomBadge';
import { sortResourceTypeTagsByCTA } from '../../../../utils/tagPriorityUtils';

export default function ShowcaseCardTag({
  tags,
  cardPanel,
  buttonText,
}: {
  tags: TagType[];
  cardPanel: boolean;
  buttonText?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Standard: Always show exactly 3 badges before the plus badge
  const MAX_VISIBLE_TAGS = 3;

  const tagObjects = tags
    .filter((tagObject) => tagObject != 'featured')
    .map((tag) => ({ tag, ...Tags[tag] }));

  const tagObjectsSorted = sortBy(tagObjects, (tagObject) => TagList.indexOf(tagObject.tag));

  const languageTags = tagObjectsSorted.filter((tag) => tag.type === 'Language');

  const modelTags = tagObjectsSorted.filter((tag) => tag.type === 'Model');

  const intelligentSolutionTags = tagObjectsSorted.filter((tag) => tag.type === 'GenerativeAI');

  const azureTags = tagObjectsSorted.filter((tag) => tag.type === 'Azure');

  const resourceTypeTags = tagObjectsSorted.filter((tag) => tag.type === 'ResourceType');

  // Sort resource type tags by CTA-based priority if buttonText is provided
  const sortedResourceTypeTags = buttonText
    ? sortResourceTypeTagsByCTA(resourceTypeTags, buttonText)
    : resourceTypeTags;

  const contentTypeTags = tagObjectsSorted.filter((tag) => tag.type === 'ContentType');

  const serviceTags = tagObjectsSorted.filter((tag) => tag.type === 'Service');

  const learningPathTags = tagObjectsSorted.filter((tag) => tag.type === 'LearningPath');

  // New priority order: Resource type → Category → Product → Language → Learning Path
  const tagsByTypeSorted = [
    ...sortedResourceTypeTags, // Resource type (with CTA-based priority)
    ...contentTypeTags, // Category
    ...intelligentSolutionTags, // Category (GenerativeAI)
    ...azureTags, // Products
    ...serviceTags, // Products
    ...languageTags, // Language
    ...modelTags,
    ...learningPathTags, // Learning Path
  ];

  if (!cardPanel) {
    // Standard: Show first tags, then show "+X more" for the rest
    const shownTags = tagsByTypeSorted.slice(0, MAX_VISIBLE_TAGS);
    const restCount = tagsByTypeSorted.length - MAX_VISIBLE_TAGS;
    const hiddenTags = tagsByTypeSorted.slice(MAX_VISIBLE_TAGS);

    return (
      <div ref={containerRef} className={styles.tagContainer}>
        {shownTags.map((tagObject, _index) => {
          const key = `showcase_card_tag_${tagObject.tag}`;

          return (
            <CustomBadge
              appearance="tint"
              size="medium"
              color="subtle"
              key={key}
              className={styles.cardTag}
            >
              {String(tagObject.label)}
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
                    {String(tagObject.label)}
                  </div>
                ))}
              </div>
            }
            relationship="label"
            key="showcase_card_tag_more"
          >
            <div
              className={styles.moreBadgeWrapper}
              style={{ display: 'inline-block', cursor: 'pointer' }}
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
        {tagsByTypeSorted.map((tagObject, _index) => {
          const _id = `showcase_card_tag_${tagObject.tag}`;
          return (
            <CustomBadge
              appearance="tint"
              size="medium"
              color="subtle"
              key={_id}
              className={styles.cardPanelColoredTag}
            >
              {String(tagObject.label)}
            </CustomBadge>
          );
        })}
      </div>
    );
  }
}

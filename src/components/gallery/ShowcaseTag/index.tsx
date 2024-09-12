/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React from "react";
import styles from "./styles.module.css";
import { Tags, type TagType } from "../../../data/tags";
import { TagList } from "../../../data/users";
import { sortBy } from "@site/src/utils/jsUtils";
import { Badge, Tooltip } from "@fluentui/react-components";

export default function ShowcaseCardTag({
  tags,
  cardPanel,
}: {
  tags: TagType[];
  cardPanel: boolean;
}) {
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
  const intelligentSolutionTags = tagObjectsSorted.filter((tag) => tag.type === "Intelligent Solution");
  const azureTags = tagObjectsSorted.filter((tag) => tag.type === "Azure");
  const resourceTypeTags = tagObjectsSorted.filter((tag) => tag.type === "ResourceType");
  const tagsByTypeSorted = [
    ...languageTags,
    ...modelTags,
    ...intelligentSolutionTags,
    ...azureTags,
    ...resourceTypeTags,
  ];
  const length = tagObjectsSorted.length;
  let number = 0;
  let totalTagsLength = 0;
  tagsByTypeSorted.some((tagObject, index) => {
    totalTagsLength += tagObject.label.length + 5;
    if (totalTagsLength > 110) {
      return true;
    }
    number = index + 1;
  });
  const rest = length - number;
  const moreTagDetailList = tagsByTypeSorted
    .slice(number, length)
    .map((tagObject) => tagObject.label)
    .join("\n");

  if (!cardPanel) {
    if (length > number) {
      return (
        <>
          {tagsByTypeSorted.slice(0, number).map((tagObject, index) => {
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
            key="showcase_card_tag_more`"
          >
            <Badge
              appearance="tint"
              size="medium"
              color="brand"
              className={styles.cardTag}
            >
              + {rest} more
            </Badge>
          </Tooltip>
        </>
      );
    } else {
      return (
        <>
          {tagsByTypeSorted.map((tagObject, index) => {
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
        </>
      );
    }
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

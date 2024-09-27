/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React from "react";
import styles from "./styles.module.css";
import { Tags, type User, type TagType } from "../../../data/tags";
import { TagList } from "../../../data/users";
import { sortBy } from "@site/src/utils/jsUtils";
import { Tooltip, Image, Button } from "@fluentui/react-components";
import useBaseUrl from "@docusaurus/useBaseUrl";
import { openai, meta, microsoft, mistralai } from "../../../data/tags";
import { useColorMode } from "@docusaurus/theme-common";

export default function ShowcaseCardIcon({ tags }: { tags: TagType[] }) {
  const tagObjects = tags
    .filter((tagObject) => tagObject != "featured")
    .map((tag) => ({ tag, ...Tags[tag] }));
  const tagObjectsSorted = sortBy(tagObjects, (tagObject) =>
    TagList.indexOf(tagObject.tag)
  );
  const languageTags = tagObjectsSorted.filter((tag) =>
    tag.type == "Language");
  const resourceTypeTags = tagObjectsSorted.filter((tag) => 
    tag.type == "ResourceType").slice(0, 1);
  const uniqueOpenAITag = tagObjectsSorted.filter((tag) =>
    tag.type == "Model" && tag.subType === openai).slice(0, 1);
  const uniqueMetaTag = tagObjectsSorted.filter((tag) =>
    tag.type == "Model" && tag.subType === meta).slice(0, 1);
  const uniqueMicrosoftTag = tagObjectsSorted.filter((tag) =>
    tag.type == "Model" && tag.subType === microsoft).slice(0, 1);
  const uniqueMistralAITag = tagObjectsSorted.filter((tag) =>
    tag.type == "Model" && tag.subType === mistralai).slice(0, 1);
  const totalTags = [...languageTags, ...uniqueOpenAITag, ...uniqueMetaTag, ...uniqueMicrosoftTag, ...uniqueMistralAITag, ...resourceTypeTags];
  const length = totalTags.length;
  let number = 3;
  const rest = length - number;

  console.log("Content Type = ", resourceTypeTags);

  const cardPanelDetailList = totalTags
    .slice(number, length)
    .map((tagObject) => tagObject.label)
    .join("\n");

  const { colorMode } = useColorMode();

  if (length > number && rest > 1) {
    return (
      <>
        {totalTags.slice(0, number).map((tagObject) => {
          const key = `showcase_card_icon_${tagObject.tag}`;
          return (
            <Tooltip
              withArrow
              content={tagObject.label}
              relationship="label"
              {...tagObject}
              key={key}
            >
              <Button
              icon={
                <Image
                alt={tagObject.label}
                src={useBaseUrl(colorMode == "dark" && tagObject.darkIcon ? tagObject.darkIcon : tagObject.icon)}
                height={16}
                width={16}
                />
              }
              />
            </Tooltip>
          );
        })}
        <Tooltip
          withArrow
          content={{
            children: (
              <span style={{ whiteSpace: "pre-line" }}>
                {cardPanelDetailList}
              </span>
            ),
          }}
          relationship="label"
          key={`showcase_card_icon_more`}
        >
          <Button className={styles.toolTip}>+{rest}</Button>
        </Tooltip>
      </>
    );
  } else {
    return (
      <>
        {totalTags.map((tagObject) => {
          const key = `showcase_card_icon_${tagObject.tag}`;
          return (
            <Tooltip
              withArrow
              content={tagObject.label}
              relationship="label"
              {...tagObject}
              key={key}
            >
              <Button
              icon={
                <Image
                alt={tagObject.label}
                src={useBaseUrl(colorMode == "dark" && tagObject.darkIcon ? tagObject.darkIcon : tagObject.icon)}
                height={16}
                width={16}
                />
              }
              />
            </Tooltip>
          );
        })}
      </>
    );
  }
}

/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import React, { useMemo } from "react";
import styles from "./styles.module.css";
import { Tags, type TagType } from "../../../data/tags";
import { TagList } from "../../../data/users";
import { sortBy } from "@site/src/utils/jsUtils";
import { Tooltip, Button } from "@fluentui/react-components";
import { TagImage } from "../TagImage";

export default function ShowcaseCardIcon({ tags }: { tags: TagType[] }) {
  const tagObjectsSorted = useMemo(() => {
    const tagObjects = tags
      .filter((tag) => tag !== "featured")
      .map((tag) => ({ tag, ...Tags[tag] }));
    return sortBy(tagObjects, (tagObject) => TagList.indexOf(tagObject.tag));
  }, [tags]);

  const uniqueModelTags = ["openai", "meta", "microsoft", "mistralai"].flatMap(
    (subType) =>
      tagObjectsSorted
        .filter((tag) => tag.type === "Model" && tag.subType === subType)
        .slice(0, 1)
  );

  const filteredTags = [
    ...tagObjectsSorted.filter((tag) => tag.type === "Language"),
    ...uniqueModelTags,
    ...tagObjectsSorted.filter((tag) => tag.type === "ResourceType").slice(0, 1),
  ];

  const displayTags = filteredTags.slice(0, 3); // First 3 Tags
  const hiddenTags = filteredTags.slice(3); // Rest of the Tags

  return (
    <>
      {displayTags.map((tagObject) => (
        <TagImage
          key={`showcase_card_icon_${tagObject.tag}`}
          tagObject={tagObject}
        />
      ))}
      {hiddenTags.length > 0 && (
        <Tooltip
          withArrow
          content={
            <span style={{ whiteSpace: "pre-line" }}>
              {hiddenTags.map((tag) => tag.label).join("\n")}
            </span>
          }
          relationship="label"
        >
          <Button className={styles.toolTip}>+{hiddenTags.length}</Button>
        </Tooltip>
      )}
    </>
  );
}

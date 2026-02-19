/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React from "react";
import styles from "./styles.module.css";
import { type User } from "../../../../data/tags";
import { PrimaryButton } from "@fluentui/react";
import ShowcaseCardTag from "../../tags/ShowcaseTag/index";
import OptimizedImage from "../../../OptimizedImage";
import { getButtonText } from "../../../../utils/buttonTextUtils";
import { useTagSections } from "./hooks/useTagSections";
import GitHubInfoRow from "./GitHubInfoRow";
import MetaInfoRow from "./MetaInfoRow";
import TagSection from "./TagSection";

export default function ShowcaseCardPanel({
  user,
  githubData,
  descriptionOverride,
}: {
  user: User;
  githubData: { forks: number; stars: number; updatedOn: Date };
  descriptionOverride?: string;
}) {
  const githubURL = user.source;
  const description = descriptionOverride || user.description;
  const video = user.video;
  const meta = user.meta || {};

  const tagSections = useTagSections(user.tags);

  return (
    <>
      <div className={styles.padding}>
        <div className={styles.cardTag}>
          <ShowcaseCardTag
            key={"tag_" + user.title}
            tags={user.tags}
            cardPanel={true}
            buttonText={getButtonText(user.website || user.source)}
          />
        </div>
        {user.image && (
          <div className={styles.imageContainer}>
            <OptimizedImage
              src={user.image}
              alt={user.title}
              width="100%"
              height="auto"
              objectFit="contain"
              style={{
                borderRadius: "16px",
                display: "block",
                maxHeight: "400px",
              }}
              priority={true}
            />
          </div>
        )}
        <div
          className={styles.githubUrl}
          onClick={() => {
            window.open(githubURL, "_blank");
          }}
        >
          {githubURL}
        </div>
        <div className={styles.gitHubData}>
          <GitHubInfoRow githubData={githubData} />
        </div>
        <MetaInfoRow meta={meta} />
      </div>
      <div className={styles.divider} />
      <div className={styles.subTitle}>Description</div>
      <div className={styles.text}>{description}</div>
      {video ? (
        <div className={styles.video}>
          <iframe
            className={styles.iframe}
            src={video}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : null}

      {tagSections.map(({ title, tags }) => (
        <TagSection key={title} title={title} tags={tags} />
      ))}

      <div className={styles.buttonSection}>
        <PrimaryButton
          className={styles.button}
          onClick={() => {
            window.open(user.website || user.source, "_blank");
          }}
        >
          <div className={styles.buttonContent}>
            <span className={styles.buttonText}>{getButtonText(user.website || user.source)}</span>
          </div>
        </PrimaryButton>
      </div>
    </>
  );
}

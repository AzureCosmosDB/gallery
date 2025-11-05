/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React from "react";
import styles from "./styles.module.css";
import { Tag, Tags, type User, type TagType } from "../../../data/tags";
import { TagList } from "../../../data/users";
import useBaseUrl from "@docusaurus/useBaseUrl";
import { Image, Link, PrimaryButton } from "@fluentui/react";
import ShowcaseCardTag from "../ShowcaseTag/index";
import { sortBy } from "../../../utils/jsUtils";
import OptimizedImage from "../../OptimizedImage";

export default function ShowcaseCardPanel({
  user,
  githubData,
}: {
  user: User;
  githubData: { forks: number; stars: number; updatedOn: Date };
}) {
  const githubURL = user.source;
  const description = user.description;
  const video = user.video;
  const tagObjects = user.tags
    .filter((tagObject) => tagObject != "featured")
    .map((tag) => ({ tag, ...Tags[tag] }));
  const tagObjectsSorted = sortBy(tagObjects, (tagObject) =>
    TagList.indexOf(tagObject.tag)
  );

  const modelTags = tagObjectsSorted.filter((tag) => tag.type === "Model");
  const vectorDatabaseTags = tagObjectsSorted.filter(
    (tag) => tag.type === "VectorDatabase"
  );
  const azureTags = tagObjectsSorted.filter((tag) => tag.type === "Azure");

  return (
    <>
      <div className={styles.padding}>
        <div className={styles.cardTag}>
          <ShowcaseCardTag
            key={"tag_" + user.title}
            tags={user.tags}
            cardPanel={true}
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
          {/* <ShowcaseMultipleAuthors key={"author_" + user.title} user={user} /> */}
          <GitHubInfoCardPanel githubData={githubData} />
        </div>
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

      {modelTags.length > 0 ? (
        <>
          <div className={styles.subTitle2}>Models</div>
          <CardPanelTag tags={modelTags} />{" "}
        </>
      ) : null}
      {vectorDatabaseTags.length > 0 ? (
        <>
          <div className={styles.subTitle2}>Vector Database</div>
          <CardPanelTag tags={vectorDatabaseTags} />{" "}
        </>
      ) : null}
      {azureTags.length > 0 ? (
        <>
          <div className={styles.subTitle2}>Services</div>
          <CardPanelTag tags={azureTags} />{" "}
        </>
      ) : null}

      <div className={styles.buttonSection}>
        <PrimaryButton
          className={styles.button}
          onClick={() => {
            window.open(user.source, "_blank");
          }}
        >
          <img
            src={useBaseUrl("/img/redirect.svg")}
            height={20}
            alt="Redirect"
          />
          <div className={styles.buttonText}>
            {tagObjectsSorted[0]?.buttonText || "View More"}
          </div>
        </PrimaryButton>
      </div>
    </>
  );
}

const GitHubInfoCardPanel = ({ githubData }) => {
  const formatNumber = (number: number): string => {
    return Intl.NumberFormat("en-US", {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(number);
  };
  const formatDate = (date: string): string => {
    return Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(new Date(date));
  };
  if (!githubData) return githubData;

  return (
    <>
      {formatDate(githubData.updatedOn) != "" &&
      formatDate(githubData.updatedOn) != "NaN" ? (
        <>
          <div className={styles.info}>•</div>
          <div className={styles.info}>
            Updated {formatDate(githubData.updatedOn)}
          </div>
        </>
      ) : null}
      {formatNumber(githubData.forks) == "NaN" ? null : (
        <>
          <div className={styles.info}>•</div>
          <Image
            alt="fork"
            src={useBaseUrl("/img/fork.svg")}
            height={16}
            width={16}
          />
          <div className={styles.info}>{formatNumber(githubData.forks)}</div>
        </>
      )}
      {formatNumber(githubData.stars) == "NaN" ? null : (
        <>
          <div className={styles.info}>•</div>
          <Image
            alt="star"
            src={useBaseUrl("/img/star.svg")}
            height={16}
            width={16}
          />
          <div className={styles.info}>{formatNumber(githubData.stars)}</div>
        </>
      )}
    </>
  );
};

function CardPanelTag({ tags }: { tags: Tag[] }) {
  return (
    <>
      {tags.map((item, index) => {
        const label = item.label;
        const subType = item.subType;
        return !subType && item.type != "Azure" ? (
          <div key={label} className={styles.cardPanelTag}>
            {/* <div className={styles.icon}>
              <img src={useBaseUrl(item.icon)} alt={label} height={20} />
            </div> */}
            <div className={styles.iconText}>{label}</div>
          </div>
        ) : (
          <div key={label} className={styles.cardPanelTag}>
            {/* {subType ? (
              <div className={styles.icon}>
                <img
                  src={useBaseUrl(item.subType.icon)}
                  alt={label}
                  height={20}
                />
              </div>
            ) : (
              <div className={styles.icon}>
                <img src={useBaseUrl(item.icon)} alt={label} height={20} />
              </div>
            )} */}
            <div className={styles.iconTextGroup}>
              <div className={styles.iconText}>{label}</div>
              <div className={styles.iconLearnMoreGroup}>
                {subType ? <div>{subType?.[0]?.label}</div> : <div>Azure</div>}
                <div>•</div>
                <Link
                  href={item.url}
                  target="_blank"
                  className={styles.iconLink}
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}

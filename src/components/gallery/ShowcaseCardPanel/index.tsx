/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React from "react";
import styles from "./styles.module.css";
import { Tag, Tags, type User, type TagType } from "../../../data/tags";
import { TagList } from "../../../data/users";
import { sortBy } from "@site/src/utils/jsUtils";
import useBaseUrl from "@docusaurus/useBaseUrl";
import { Image, Link, MessageBar, MessageBarType, PrimaryButton } from "@fluentui/react";
import ShowcaseMultipleAuthors from "../ShowcaseMultipleAuthors/index";
import ShowcaseCardTag from "../ShowcaseTag/index";
import { useColorMode } from "@docusaurus/theme-common";

export default function ShowcaseCardPanel({
  user,
  githubData,
}: {
  user: User;
  githubData: { forks: number; stars: number; updatedOn: Date };
}) {
  const githubURL = user.source.toLowerCase();
  const title = user.title;
  const description = user.description;
  const video = user.video;
  const tagObjects = user.tags
    .filter((tagObject) => tagObject != "featured")
    .map((tag) => ({ tag, ...Tags[tag] }));
  const tagObjectsSorted = sortBy(tagObjects, (tagObject) =>
    TagList.indexOf(tagObject.tag)
  );
  const languageTags = tagObjectsSorted.filter((tag) => tag.type === "Language");
  const modelTags = tagObjectsSorted.filter((tag) => tag.type === "Model");
  const azureTags = tagObjectsSorted.filter((tag) => tag.type === "Azure");


  return (
    <>
      <div className={styles.padding}>
        <div className={styles.divider} />
        <div className={styles.githubUrl}
          onClick={() => {
            window.open(githubURL, '_blank');
          }}>{githubURL}</div>
        <div className={styles.title}>{title}</div>
        <div className={styles.gitHubData}>
          <ShowcaseMultipleAuthors key={"author_" + user.title} user={user} />
          <GitHubInfoCardPanel githubData={githubData} />
        </div>
      </div>
      <div className={styles.cardTag}>
        <ShowcaseCardTag
          key={"tag_" + user.title}
          tags={user.tags}
          cardPanel={true}
        />
      </div>
      {user.previewTags ? <MessageBar
        messageBarType={MessageBarType.severeWarning}
        isMultiline={false}
      >
        This template features one or more services that are in preview.
        <Link href="www.bing.com" target="_blank" underline>
          Learn more
        </Link>
      </MessageBar> : null}
      <div className={styles.subTitle}>Template overview</div>
      <div className={styles.text}>{description}</div>
      {video ? <div className={styles.video}>
        <iframe
          className={styles.iframe}
          src={video}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div> : null}
      <div className={styles.subTitle}>Included in this template</div>
      <div className={styles.text}>The languages & services used in this template are subject to their normal
        usage fees. Learn more about the cost of services by using the <Link href="https://azure.microsoft.com/en-us/pricing/calculator/"
          target="_blank"
          className={styles.color}>Azure Pricing Calculator</Link>.</div>
      {languageTags.length > 0 ? <><div className={styles.subTitle2}>Languages</div>
        <CardPanelTag tags={languageTags} /> </> : null
      }
      {modelTags.length > 0 ? <><div className={styles.subTitle2}>Models</div>
        <CardPanelTag tags={modelTags} /> </> : null
      }
      {azureTags.length > 0 ? <><div className={styles.subTitle2}>Services</div>
        <CardPanelTag tags={azureTags} /> </> : null
      }
      <div className={styles.buttonSection}>
        <div className={styles.divider} />
        <PrimaryButton
          className={styles.button}
          onClick={() => {
            window.open(user.source, '_blank');
          }}
        >
          <img src={useBaseUrl("/img/redirect.svg")} height={24} alt="Redirect" />
          <div className={styles.buttonText}>Go to GitHub repo</div>
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
  const { colorMode } = useColorMode();

  return (
    <>
      {formatDate(githubData.updatedOn) != "" ? (
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
            src={colorMode == "dark" ? useBaseUrl("/img/forkDark.svg") : useBaseUrl("/img/fork.svg")}
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
            src={colorMode == "dark" ? useBaseUrl("/img/starDark.svg") : useBaseUrl("/img/star.svg")}
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
  const { colorMode } = useColorMode();
  return (
    <>
      {tags.map((item, index) => {
        const label = item.label;
        const subType = item.subType;
        return (!subType && item.type != "Azure" ? (
          <div
            key={label}
            className={styles.cardPanelTag}
          >
            <div className={styles.icon}><img src={useBaseUrl(item.icon)} alt={label} height={20} /></div>
            <div className={styles.iconText}>
              {label}
            </div>
          </div>
        ) : (
          <div
            key={label}
            className={styles.cardPanelTag}
          >
            {subType ? <div className={styles.icon}>
              <img
                src={colorMode == "dark" && item.subType.darkIcon ? useBaseUrl(item.subType.darkIcon) : useBaseUrl(item.subType.icon)}
                alt={label}
                height={20} />
            </div> :
              <div className={styles.icon}><img src={useBaseUrl(item.icon)} alt={label} height={20} /></div>}
            <div className={styles.iconTextGroup}>
              <div className={styles.iconText}>
                {label}
              </div>
              <div className={styles.iconLearnMoreGroup}>
                {subType ? <div>{subType.label}</div> : <div>Azure</div>}
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
        ));
      })}
    </>
  );
}

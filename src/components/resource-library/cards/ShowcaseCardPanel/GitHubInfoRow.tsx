import React from "react";
import { Image } from "@fluentui/react";
import useBaseUrl from "@docusaurus/useBaseUrl";
import styles from "./styles.module.css";
import { formatCompactNumber, formatShortDate, parseDate } from "./utils/format";

type GitHubData = { forks: number; stars: number; updatedOn: Date | string };

export default function GitHubInfoRow({ githubData }: { githubData?: GitHubData }) {
  if (!githubData) return null;

  const updatedDate = parseDate(githubData.updatedOn);
  const updated = updatedDate ? formatShortDate(updatedDate) : null;

  return (
    <>
      {updated && (
        <>
          <div className={styles.info}>•</div>
          <div className={styles.info}>Updated {updated}</div>
        </>
      )}

      {Number.isFinite(githubData.forks) && (
        <>
          <div className={styles.info}>•</div>
          <Image alt="fork" src={useBaseUrl("/img/fork.svg")} height={16} width={16} />
          <div className={styles.info}>{formatCompactNumber(githubData.forks)}</div>
        </>
      )}

      {Number.isFinite(githubData.stars) && (
        <>
          <div className={styles.info}>•</div>
          <Image alt="star" src={useBaseUrl("/img/star.svg")} height={16} width={16} />
          <div className={styles.info}>{formatCompactNumber(githubData.stars)}</div>
        </>
      )}
    </>
  );
}

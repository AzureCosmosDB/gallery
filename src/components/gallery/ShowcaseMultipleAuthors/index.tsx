/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React from "react";
import styles from "./styles.module.css";
import { type User } from "../../../data/tags";
import { Link } from "@fluentui/react";

function ShowcaseMultipleWebsites(
  key: number,
  authorName: string,
  websiteLink: string,
  length: number,
  i: number
) {
  if (i != length - 1) {
    return (
      <Link
        className={styles.color}
        key={key}
        href={websiteLink}
        target="_blank"
      >
        {authorName},
      </Link>
    );
  } else {
    return (
      <Link
        className={styles.color}
        key={key}
        href={websiteLink}
        target="_blank"
      >
        {authorName}
      </Link>
    );
  }
}

export default function ShowcaseMultipleAuthors({ user }: { user: User }) {
  const authors = user.author;
  const websites = user.website;
  let i = 0;

  if (authors.includes(", ")) {
    var multiWebsites = websites.split(", ");
    var multiAuthors = authors.split(", ");

    if (multiWebsites.length != multiAuthors.length) {
      throw new Error(
        "The number of multiple authors(" +
          multiAuthors.length +
          ") and websites(" +
          multiWebsites.length +
          ") are not equal."
      );
    }

    return (
      <>
        <div>by</div>
        {multiWebsites.map((value, index) => {
          return ShowcaseMultipleWebsites(
            index,
            multiAuthors[index],
            multiWebsites[index],
            multiWebsites.length,
            i++
          );
        })}
      </>
    );
  }

  return (
    <>
      <div>by</div>
      <Link className={styles.color} key={authors} href={websites} target="_blank">
        {authors}
      </Link>
    </>
  );
}

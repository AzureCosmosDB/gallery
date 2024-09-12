/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React from "react";
import { InputValue } from "../../../pages/ShowcaseCardPage";
import useBaseUrl from "@docusaurus/useBaseUrl";
import { Text, Image, Subtitle1, Body2 } from "@fluentui/react-components";
import styles from "./styles.module.css";

export default function ShowcaseEmptyResult({ id }: { id: string }) {
  return (
    <div
      id={id}
      className={styles.emptyResultSection}
    >
      {InputValue != null ? (
        <>
          <Image
            src={useBaseUrl("/img/searchQuestionmark.svg")}
            alt="searchQuestionmark"
            height={128}
            width={128}
          />
          <div className={styles.resultSection}>
            <Subtitle1>
              We couldn’t find any results for '{InputValue}'
            </Subtitle1>
            <Body2>
              Check for spelling or try searching for another term.
            </Body2>
          </div>
        </>
      ) : (
        <>
          <div className={styles.resultSection}>
            <Subtitle1>
              We couldn’t find any results.
            </Subtitle1>
            <Body2>
              Check for tags or try filtering for another tag.
            </Body2>
          </div>
        </>
      )}
    </div>
  );
}

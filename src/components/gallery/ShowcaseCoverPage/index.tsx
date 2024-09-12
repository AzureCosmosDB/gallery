/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React from "react";
import {
  Title1,
  Title3,
  Display,
} from "@fluentui/react-components";
import styles from "./styles.module.css";
import useBaseUrl from "@docusaurus/useBaseUrl";
import { featuredUsers } from "../../../data/users";
import ShowcaseCards from "../../../pages/ShowcaseCards";
import { useColorMode } from "@docusaurus/theme-common";

const title = "Azure Cosmos DB AI Samples";
const description =
  "Get started with AI application patterns with Azure Cosmos DB";
const subtitle = "Featured AI Resources";

export default function ShowcaseCoverPage() {
  const { colorMode } = useColorMode();
  return (
    <div className={styles.coverPageContainer}>
      <img
        src={colorMode == "dark" ? useBaseUrl("/img/coverBackgroundDark.png") : useBaseUrl("/img/coverBackground.png")}
        className={styles.cover}
        onError={({ currentTarget }) => {
          currentTarget.style.display = "none";
        }}
        alt=""
      />
      <div className={styles.coverPageAreaContainer}>
        <div className={styles.coverPageArea}>
          <div className={styles.titleSection}>
            <Display>{title}</Display>
            <Title3>{description}</Title3>
          </div>
          <div className={styles.subtitleSection}>
            <Title1>{subtitle}</Title1>
            <ShowcaseCards filteredUsers={featuredUsers} coverPage={true} />
          </div>
        </div>
      </div>
    </div>
  );
}

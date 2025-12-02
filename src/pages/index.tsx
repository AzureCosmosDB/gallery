/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { useState, useEffect } from "react";
import Layout from "@theme/Layout";
import ShowcaseLeftFilters from "../components/gallery/ShowcaseLeftFilters";
import ShowcaseCoverPage from "../components/gallery/ShowcaseCoverPage";
import ShowcaseCardPage, { UserState } from "./ShowcaseCardPage";
import {
  FluentProvider,
  webLightTheme,
  webDarkTheme,
} from "@fluentui/react-components";
import { initializeIcons } from "@fluentui/react/lib/Icons";
import ExecutionEnvironment from "@docusaurus/ExecutionEnvironment";
import { useColorMode } from "@docusaurus/theme-common";
import styles from "./styles.module.css";
import { type TagType } from "@site/src/data/tags";
import { TagList } from "@site/src/data/users";
import { useLocation } from "@docusaurus/router";
import { Helmet } from "react-helmet";

initializeIcons();

export function prepareUserState(): UserState | undefined {
  if (ExecutionEnvironment.canUseDOM) {
    return {
      scrollTopPosition: window.scrollY,
      focusedElementId: document.activeElement?.id,
    };
  }

  return undefined;
}

const TagQueryStringKey = "tags";
const readSearchTags = (search: string): TagType[] => {
  return new URLSearchParams(search).getAll(TagQueryStringKey) as TagType[];
};
const replaceSearchTags = (search: string, newTags: TagType[]) => {
  const searchParams = new URLSearchParams(search);
  searchParams.delete(TagQueryStringKey);
  newTags.forEach((tag) => searchParams.append(TagQueryStringKey, tag));
  return searchParams.toString();
};
const App = () => {
  const location = useLocation<UserState>();
  const { colorMode } = useColorMode();
  const [loading, setLoading] = useState(true);
  const [selectedCheckbox, setSelectedCheckbox] = useState<TagType[]>([]);
  const [selectedTags, setSelectedTags] = useState<TagType[]>([]);
  const [activeTags, setActiveTags] = useState<TagType[]>(TagList);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 500);
    
    // Read tags from location search regardless of loading state
    const tags = readSearchTags(location.search);
    setSelectedCheckbox(tags);
    setSelectedTags(tags);
  }, [location]);

  // You can still render null for loading state, but hooks should always run
  if (loading) {
    return null; // This will not affect hook calls as all hooks are already called
  }

  return (
    <FluentProvider
      theme={colorMode == "dark" ? webDarkTheme : webLightTheme}
      className={styles.container}
    >
      <ShowcaseCoverPage />
      <div className={styles.filterAndCardContainer}>
        <div className={styles.filterAndCard}>
          <div className={styles.filter}>
            <ShowcaseLeftFilters
              activeTags={activeTags}
              selectedCheckbox={selectedCheckbox}
              setSelectedCheckbox={setSelectedCheckbox}
              location={location}
              setSelectedTags={setSelectedTags}
              selectedTags={selectedTags}
              readSearchTags={readSearchTags}
              replaceSearchTags={replaceSearchTags}
            />
          </div>
          <div className={styles.card}>
            <ShowcaseCardPage
              setActiveTags={setActiveTags}
              selectedTags={selectedTags}
              location={location}
              setSelectedTags={setSelectedTags}
              setSelectedCheckbox={setSelectedCheckbox}
              readSearchTags={readSearchTags}
              replaceSearchTags={replaceSearchTags}
            />
          </div>
        </div>
      </div>
    </FluentProvider>
  );
};


export default function Showcase(): JSX.Element {
  return (
    <>
      <Helmet>
        <title>Azure Cosmos DB Gallery</title>
        <meta name="description" content="Your best source for patterns and content for Azure Cosmos DB" />
        <meta name="keywords" content="Azure Cosmos DB, samples, Gen-AI, Azure OpenAI, GitHub, OSS, content" />
        <meta name="author" content="Azure Cosmos DB Team" />
        <meta property="og:title" content="Azure Cosmos DB Gallery" />
        <meta property="og:description" content="Your best source for patterns and content for Azure Cosmos DB" />
        <meta property="og:image" content="https://azurecosmosdb.github.io/gallery/img/gallery-social.png" />
        <meta property="og:url" content="https://azurecosmosdb.github.io/gallery" />
        <meta name="twitter:card" content="Azure Cosmos DB Gallery Home Page" />
        <meta name="twitter:title" content="Azure Cosmos DB Gallery" />
        <meta name="twitter:description" content="Your best source for patterns and content for Azure Cosmos DB" />
        <meta name="twitter:image" content="https://azurecosmosdb.github.io/gallery/img/gallery-social.png" />
        <meta name="twitter:url" content="https://azurecosmosdb.github.io/gallery"/>
      </Helmet>
    <Layout>
      <App />
    </Layout>
  </>
  );
}

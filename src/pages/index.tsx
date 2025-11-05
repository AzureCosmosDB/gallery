import LearningPathsSection from "../components/LearningPathsSection";
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { useState, useEffect } from "react";
import Layout from "@theme/Layout";
import ShowcaseLeftFilters from "../components/gallery/ShowcaseLeftFilters";
import ShowcaseCoverPage from "../components/gallery/ShowcaseCoverPage";
import ShowcaseCardPage, { UserState } from "./ShowcaseCardPage";
import QuickLinks from "../components/QuickLinks";
import CommunitySupportSection from "../components/CommunitySupportSection";
import DisclaimerSection from "../components/DisclaimerSection";
import { FluentProvider, webLightTheme } from "@fluentui/react-components";
import { initializeIcons } from "@fluentui/react/lib/Icons";
import ExecutionEnvironment from "@docusaurus/ExecutionEnvironment";
import styles from "./styles.module.css";
import { type TagType } from "../data/tags";
import { TagList, featuredUsers } from "../data/users";
import { useLocation } from "@docusaurus/router";
import { Helmet } from "react-helmet";
import { preloadFeaturedImages } from "../utils/imagePreloader";

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
  const [selectedCheckbox, setSelectedCheckbox] = useState<TagType[]>([]);
  const [selectedTags, setSelectedTags] = useState<TagType[]>([]);
  const [activeTags, setActiveTags] = useState<TagType[]>(TagList);

  useEffect(() => {
    // Read tags from location search
    const tags = readSearchTags(location.search);
    setSelectedCheckbox(tags);
    setSelectedTags(tags);
    
    // Preload featured images for better performance
    preloadFeaturedImages(featuredUsers, 8);
  }, [location]);

  return (
    <FluentProvider theme={webLightTheme} className={styles.container}>
      <div id="home">
        <ShowcaseCoverPage />
      </div>
      <div id="learning-paths" className={styles.learningPathStyled}>
        <LearningPathsSection />
      </div>
      <div id="resource-library">
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
      </div>
      <div id="quick-links">
        <QuickLinks />
      </div>
      <div id="community-support">
        <CommunitySupportSection />
      </div>
    </FluentProvider>
  );
};

export default function Showcase(): JSX.Element {
  return (
    <>
      <Helmet>
        <title>Azure PostgreSQL App Dev Hub</title>
        <meta
          name="description"
          content="Your best source for patterns and content for Azure Cosmos DB"
        />
        <meta
          name="keywords"
          content="Azure Cosmos DB, samples, Gen-AI, Azure OpenAI, GitHub, OSS, content"
        />
        <meta name="author" content="Azure Cosmos DB Team" />
        <meta property="og:title" content="Azure PostgreSQL App Dev Hub" />
        <meta
          property="og:description"
          content="Your best source for patterns and content for Azure Cosmos DB"
        />
        <meta
          property="og:image"
          content="https://azurecosmosdb.github.io/gallery/img/gallery-social.png"
        />
        <meta
          property="og:url"
          content="https://azurecosmosdb.github.io/gallery"
        />
        <meta
          name="twitter:card"
          content="Azure PostgreSQL App Dev Hub Home Page"
        />
        <meta name="twitter:title" content="Azure PostgreSQL App Dev Hub" />
        <meta
          name="twitter:description"
          content="Your best source for patterns and content for Azure Cosmos DB"
        />
        <meta
          name="twitter:image"
          content="https://azurecosmosdb.github.io/gallery/img/gallery-social.png"
        />
        <meta
          name="twitter:url"
          content="https://azurecosmosdb.github.io/gallery"
        />
      </Helmet>
      <Layout>
        <App />
      </Layout>
      <DisclaimerSection />
    </>
  );
}

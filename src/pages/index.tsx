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
import StructuredData from "@site/src/components/StructuredData";

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
      <StructuredData />
      <Helmet>
        <title>Azure Cosmos DB Gallery | AI Apps, Vector Search & Code Samples</title>
        <meta name="description" content="Discover 100+ code samples, tutorials, and resources for building AI applications with Azure Cosmos DB. Featuring RAG patterns, vector search with DiskANN, multi-agent systems, and OpenAI integrations in Python, C#, JavaScript, and Java." />
        <meta name="keywords" content="Azure Cosmos DB, vector search, RAG pattern, AI samples, OpenAI, semantic kernel, langchain, DiskANN, NoSQL, MongoDB, multi-agent, MCP, vector database, generative AI, embeddings, Python, C#, JavaScript, Java" />
        <meta name="author" content="Azure Cosmos DB Team" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://azurecosmosdb.github.io/gallery/" />
        <meta property="og:title" content="Azure Cosmos DB Gallery | AI Apps & Vector Search" />
        <meta property="og:description" content="Discover 100+ code samples and resources for building AI applications with Azure Cosmos DB, featuring RAG patterns, vector search, and multi-agent systems." />
        <meta property="og:image" content="https://azurecosmosdb.github.io/gallery/img/gallery-social.png" />
        <meta property="og:site_name" content="Azure Cosmos DB Gallery" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@AzureCosmosDB" />
        <meta name="twitter:creator" content="@AzureCosmosDB" />
        <meta name="twitter:url" content="https://azurecosmosdb.github.io/gallery/" />
        <meta name="twitter:title" content="Azure Cosmos DB Gallery | AI Apps & Vector Search" />
        <meta name="twitter:description" content="Discover 100+ code samples for building AI applications with Azure Cosmos DB" />
        <meta name="twitter:image" content="https://azurecosmosdb.github.io/gallery/img/gallery-social.png" />
        
        {/* Additional SEO */}
        <link rel="canonical" href="https://azurecosmosdb.github.io/gallery/" />
        <meta name="robots" content="index, follow" />
        <meta name="theme-color" content="#0078d4" />
      </Helmet>
    <Layout>
      <App />
    </Layout>
  </>
  );
}

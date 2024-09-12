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
  const { colorMode } = useColorMode();
  const [loading, setLoading] = useState(true);
  const [selectedCheckbox, setSelectedCheckbox] = useState<TagType[]>([]);
  const [selectedTags, setSelectedTags] = useState<TagType[]>([]);
  const location = useLocation<UserState>();
  const [activeTags, setActiveTags] = useState<TagType[]>(TagList);

  useEffect(() => {
    setSelectedTags(readSearchTags(location.search));
    setSelectedCheckbox(readSearchTags(location.search));
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, [location]);


  return !loading ? (
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
  ) : null;
};

export default function Showcase(): JSX.Element {
  return (
    <Layout>
      <App />
    </Layout>
  );
}

import React, { useState, useEffect } from 'react';
import ShowcaseLeftFilters from '../resource-library/filters/ShowcaseLeftFilters';
import ShowcaseCardPage from './sections/ResourceLibrarySection';
import type { UserState } from './sections/ResourceLibrarySection/types';
import QuickLinks from './sections/QuickLinks';
import CommunitySupportSection from './sections/CommunitySupportSection';
import LearningPathsSection from './sections/LearningPathsSection';
import HeroCover from './sections/HeroSection';
import DisclaimerSection from './sections/DisclaimerSection';
import { FluentProvider, webLightTheme } from '@fluentui/react-components';
import { initializeIcons } from '@fluentui/react/lib/Icons';
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';
import styles from './styles.module.css';
import { type TagType } from '../../data/tags';
import { TagList } from '../../data/users';
import { useLocation } from '@docusaurus/router';
import { Helmet } from 'react-helmet';

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

const TagQueryStringKey = 'tags';
const readSearchTags = (search: string): TagType[] => {
  const params = new URLSearchParams(search);
  const tagValues = params.getAll(TagQueryStringKey);

  // Handle both comma-separated values and individual parameters
  const allTags: string[] = [];
  tagValues.forEach((value) => {
    if (value.includes(',')) {
      // Split comma-separated values
      allTags.push(
        ...value
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean)
      );
    } else {
      // Individual tag value
      allTags.push(value);
    }
  });

  return allTags as TagType[];
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
  }, [location]);

  return (
    <FluentProvider theme={webLightTheme} className={styles.container}>
      <div id="home">
        <HeroCover />
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
                activeTags={activeTags}
                selectedTags={selectedTags}
                location={location}
                setSelectedTags={setSelectedTags}
                setSelectedCheckbox={setSelectedCheckbox}
                selectedCheckbox={selectedCheckbox}
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

export default function HomePage(): JSX.Element {
  return (
    <>
      <Helmet>
        <title>Azure PostgreSQL App Dev Hub</title>
        <meta
          name="description"
          content="Your best source for patterns and content for Azure PostgreSQL"
        />
        <meta name="keywords" content="Azure PostgreSQL, samples, Gen-AI, Azure OpenAI, GitHub" />
        <meta name="author" content="Azure PostgreSQL Team" />
        <meta property="og:title" content="Azure PostgreSQL App Dev Hub" />
        <meta
          property="og:description"
          content="Your best source for patterns and content for Azure PostgreSQL"
        />
        <meta name="twitter:card" content="Azure PostgreSQL App Dev Hub Home Page" />
        <meta name="twitter:title" content="Azure PostgreSQL App Dev Hub" />
        <meta
          name="twitter:description"
          content="Your best source for patterns and content for Azure PostgreSQL"
        />
        <meta name="twitter:url" content="https://x.com/AzureDBPostgres" />
      </Helmet>
      <App />
      <DisclaimerSection />
    </>
  );
}

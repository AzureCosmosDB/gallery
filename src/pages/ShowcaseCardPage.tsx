/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 *
 * ShowcaseCardPage - Main resource library page with filtering, sorting, and view modes.
 */

import React, { useState, useMemo, useEffect } from "react";
import { useHistory } from "@docusaurus/router";
import { Spinner, Title1, Title3 } from "@fluentui/react-components";
import type { User, TagType } from "../data/tags";
import { prepareUserState } from "./index";

// Components
import ShowcaseCards from "./ShowcaseCards";
import ShowcaseList from "./ShowcaseList";
import MobileFilterDrawer from "../components/gallery/MobileFilterDrawer";
import FilterAppliedBar from "../components/gallery/FilterAppliedBar";
import SearchFilterBar, { readSearchName } from "../components/gallery/SearchFilterBar";
import ViewToggle, { type ViewType } from "../components/gallery/ViewToggle";
import SortDropdown from "../components/gallery/SortDropdown";
import ResultsSummary from "../components/gallery/ResultsSummary";

// Utilities
import { getSortedUsers, SORT_BY_OPTIONS } from "../utils/sortingUtils";
import { filterUsers, computeActiveTags } from "../utils/filterUtils";

// Styles
import styles from "./styles.module.css";

// ============================================================================
// Types
// ============================================================================

export type UserState = {
  scrollTopPosition: number;
  focusedElementId: string | undefined;
};

export interface ShowcaseCardPageProps {
  setActiveTags: React.Dispatch<React.SetStateAction<TagType[]>>;
  activeTags: TagType[];
  selectedTags: TagType[];
  location: Location & { state?: UserState };
  setSelectedTags: React.Dispatch<React.SetStateAction<TagType[]>>;
  setSelectedCheckbox: React.Dispatch<React.SetStateAction<TagType[]>>;
  selectedCheckbox: TagType[];
  readSearchTags: (search: string) => TagType[];
  replaceSearchTags: (search: string, newTags: TagType[]) => string;
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Restores scroll position and focus from saved user state.
 */
function restoreUserState(userState: UserState | null): void {
  const { scrollTopPosition, focusedElementId } = userState ?? {
    scrollTopPosition: 0,
    focusedElementId: undefined,
  };

  if (focusedElementId) {
    document.getElementById(focusedElementId)?.focus();
  }
  window.scrollTo({ top: scrollTopPosition });
}

// ============================================================================
// Custom Hooks
// ============================================================================

/**
 * Hook to manage view type with support for external "switchToListView" event.
 */
function useViewType(initialView: ViewType = "grid") {
  const [viewType, setViewType] = useState<ViewType>(initialView);

  useEffect(() => {
    const handler = () => setViewType("list");
    window.addEventListener("switchToListView", handler);
    return () => window.removeEventListener("switchToListView", handler);
  }, []);

  return [viewType, setViewType] as const;
}

/**
 * Hook to manage filtered and sorted users.
 */
function useFilteredUsers(
  sortOption: string,
  selectedTags: TagType[],
  searchName: string | null,
): User[] {
  const sortedUsers = useMemo(() => getSortedUsers(sortOption), [sortOption]);

  return useMemo(
    () => filterUsers(sortedUsers, selectedTags, searchName),
    [sortedUsers, selectedTags, searchName],
  );
}

// ============================================================================
// Sub-Components
// ============================================================================

interface HeaderSectionProps {
  title: string;
  description: string;
}

function HeaderSection({ title, description }: HeaderSectionProps): React.JSX.Element {
  return (
    <div className={styles.titleSection}>
      <Title1 className={styles.resourceTitle}>{title}</Title1>
      <Title3 className={styles.centeredDescription}>{description}</Title3>
    </div>
  );
}

interface SearchAndSortSectionProps {
  sortOption: string;
  onSortChange: (option: string) => void;
  setLoading: (loading: boolean) => void;
  viewType: ViewType;
  onViewChange: (viewType: ViewType) => void;
}

function SearchAndSortSection({
  sortOption,
  onSortChange,
  setLoading,
  viewType,
  onViewChange,
}: SearchAndSortSectionProps): React.JSX.Element {
  const analyticsData = `{"cN":"Searchbox"}`;

  return (
    <div className={styles.searchAndSortBarSection}>
      <SearchFilterBar data-m={analyticsData} />
      <div className={styles.sortAndViewBar}>
        <SortDropdown
          sortOption={sortOption}
          onSortChange={onSortChange}
          setLoading={setLoading}
        />
        <ViewToggle viewType={viewType} onViewChange={onViewChange} />
      </div>
    </div>
  );
}

interface ResourceContentProps {
  loading: boolean;
  viewType: ViewType;
  cards: User[];
}

function ResourceContent({
  loading,
  viewType,
  cards,
}: ResourceContentProps): React.JSX.Element {
  if (loading) {
    return <Spinner labelPosition="below" label="Loading..." />;
  }

  if (viewType === "grid") {
    return <ShowcaseCards filteredUsers={cards} coverPage={false} />;
  }

  return (
    <ShowcaseList
      filteredUsers={cards}
      key={cards.map((u) => u.title).join("-")}
    />
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function ShowcaseCardPage({
  setActiveTags,
  activeTags,
  selectedTags,
  location,
  setSelectedTags,
  setSelectedCheckbox,
  selectedCheckbox,
  readSearchTags,
  replaceSearchTags,
}: ShowcaseCardPageProps): React.JSX.Element {
  const history = useHistory();

  // State
  const [viewType, setViewType] = useViewType("grid");
  const [sortOption, setSortOption] = useState<string>(SORT_BY_OPTIONS[1]);
  const [loading, setLoading] = useState(true);
  const [searchName, setSearchName] = useState<string | null>(null);

  // Derived data
  const cards = useFilteredUsers(sortOption, selectedTags, searchName);
  const resourceCount = cards.length;
  const filterCount = selectedTags.length;

  // Sync state with URL on location/sort changes
  useEffect(() => {
    setSelectedTags(readSearchTags(location.search));
    setSearchName(readSearchName(location.search));
    restoreUserState(location.state ?? null);
    setLoading(false);
  }, [location, sortOption, readSearchTags, setSelectedTags]);

  // Update active tags when cards or selection changes
  useEffect(() => {
    const newActiveTags = computeActiveTags(cards, selectedTags);
    setActiveTags(newActiveTags);
  }, [cards, selectedTags, setActiveTags]);

  // Handlers
  const handleClearAll = () => {
    setSelectedTags([]);
    setSelectedCheckbox([]);

    const searchParams = new URLSearchParams(location.search);
    searchParams.delete("tags");

    history.push({
      ...location,
      search: searchParams.toString(),
      state: prepareUserState(),
    });
  };

  const handleSortChange = (option: string) => {
    setSortOption(option);
  };

  return (
    <>
      <div>
        <HeaderSection
          title="Resource Library"
          description="Explore our comprehensive collection of documentation, tutorials, videos, and solution accelerators to help you build amazing applications with PostgreSQL on Azure."
        />

        <SearchAndSortSection
          sortOption={sortOption}
          onSortChange={handleSortChange}
          setLoading={setLoading}
          viewType={viewType}
          onViewChange={setViewType}
        />

        <div className={styles.templateResultsNumberContainer}>
          <ResultsSummary count={resourceCount} searchTerm={searchName} />

          <div className={styles.mobileFilterButtonContainer}>
            <MobileFilterDrawer
              activeTags={activeTags}
              selectedCheckbox={selectedCheckbox}
              setSelectedCheckbox={setSelectedCheckbox}
              location={location}
              selectedTags={selectedTags}
              setSelectedTags={setSelectedTags}
              readSearchTags={readSearchTags}
              replaceSearchTags={replaceSearchTags}
              sortOption={sortOption}
              setSortOption={setSortOption}
              filterCount={filterCount}
            />
          </div>
        </div>
      </div>

      <FilterAppliedBar
        selectedTags={selectedTags}
        onClearAll={handleClearAll}
        readSearchTags={readSearchTags}
        replaceSearchTags={replaceSearchTags}
      />

      <ResourceContent loading={loading} viewType={viewType} cards={cards} />
    </>
  );
}

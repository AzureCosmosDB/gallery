/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useHistory, useLocation } from "@docusaurus/router";
import { Tags, type User, type TagType } from "../data/tags";
import { sortedUsers, unsortedUsers } from "../data/users";
import {
  Text,
  Option,
  Spinner,
  Badge,
  Body1,
  Dropdown,
  Display,
  Title3,
  Title2,
  Title1,
} from "@fluentui/react-components";
import { SearchBox } from "@fluentui/react-search";
import ShowcaseCards from "./ShowcaseCards";
import ShowcaseList from "./ShowcaseList";
import styles from "./styles.module.css";
import { toggleListItem } from "../utils/jsUtils";
import { prepareUserState } from "./index";
import { Dismiss20Filled } from "@fluentui/react-icons";
import MobileFilterDrawer from "../components/gallery/MobileFilterDrawer";
import { Grid3x3, List } from "lucide-react";

function restoreUserState(userState: UserState | null) {
  const { scrollTopPosition, focusedElementId } = userState ?? {
    scrollTopPosition: 0,
    focusedElementId: undefined,
  };
  document.getElementById(focusedElementId)?.focus();
  window.scrollTo({ top: scrollTopPosition });
}

const TagQueryStringKey2 = "tags";

function replaceSearchTags(search: string, newTags: TagType[]) {
  const searchParams = new URLSearchParams(search);
  searchParams.delete(TagQueryStringKey2);
  newTags.forEach((tag) => searchParams.append(TagQueryStringKey2, tag));
  return searchParams.toString();
}

const SORT_BY_OPTIONS = ["Newest", "Recommended"];

export var InputValue: string | null = null;
export type UserState = {
  scrollTopPosition: number;
  focusedElementId: string | undefined;
};

function readSortChoice(rule: string): User[] {
  if (rule == SORT_BY_OPTIONS[0]) {
    // Sort by newest date first
    const copyUnsortedUser = unsortedUsers.slice();
    return copyUnsortedUser.sort((a, b) => {
      // Handle cases where date might be empty or undefined
      const dateA = a.date || "1970-01-01";
      const dateB = b.date || "1970-01-01";
      // Sort in descending order (newest first)
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });
  } else if (rule == SORT_BY_OPTIONS[1]) {
    // Sort by priority: P0 > P1 > P2, then by solution accelerator tag, then by original order
    const copyUnsortedUser = unsortedUsers.slice();
    return copyUnsortedUser.sort((a, b) => {
      // Define priority order (P0 = highest priority = 0, P1 = 1, P2 = 2, no priority = 3)
      const priorityOrder = { P0: 0, P1: 1, P2: 2 };
      const priorityA = priorityOrder[a.priority] ?? 3; // Default to lowest priority if not set
      const priorityB = priorityOrder[b.priority] ?? 3;

      // Sort by priority (ascending - lower number = higher priority)
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }

      // If priorities are equal, prioritize solution accelerator items
      const hasSolutionAcceleratorA = a.tags.includes("solution-accelerator");
      const hasSolutionAcceleratorB = b.tags.includes("solution-accelerator");

      if (hasSolutionAcceleratorA && !hasSolutionAcceleratorB) {
        return -1; // A comes before B
      }
      if (!hasSolutionAcceleratorA && hasSolutionAcceleratorB) {
        return 1; // B comes before A
      }

      // If both have same priority and same solution accelerator status, sort by original order
      return (a.order || 0) - (b.order || 0);
    });
  }
  // Default case: maintain original order from templates.json
  return unsortedUsers.slice().sort((a, b) => (a.order || 0) - (b.order || 0));
}
const SearchNameQueryKey = "name";

function readSearchName(search: string) {
  return new URLSearchParams(search).get(SearchNameQueryKey);
}

function FilterAppliedBar({
  clearAll,
  selectedTags,
  readSearchTags,
  replaceSearchTags,
}: {
  clearAll;
  selectedTags: TagType[];
  readSearchTags: (search: string) => TagType[];
  replaceSearchTags: (search: string, newTags: TagType[]) => string;
}) {
  const history = useHistory();
  const toggleTag = (tag: TagType, location: Location) => {
    const tags = readSearchTags(location.search);
    const wasSelected = tags.includes(tag);
    let newTags = toggleListItem(tags, tag);

    // If a parent/base tag is being deselected from the badge, also clear its sub-filters
    if (wasSelected) {
      const tagObject = Tags[tag];
      if (
        tagObject &&
        Array.isArray(tagObject.subType) &&
        tagObject.subType.length > 0
      ) {
        const subKeys = tagObject.subType.map(
          (s) => s.label.toLowerCase() as TagType,
        );
        newTags = newTags.filter((t) => !subKeys.includes(t));
      }
    }
    const newSearch = replaceSearchTags(location.search, newTags);
    if (typeof window.gtag === "function") {
      window.gtag("set", "user_properties", {
        page_location: window.location.href,
        page_path: newTags,
      });
    }
    history.push({
      ...location,
      search: newSearch,
      state: prepareUserState(),
    });

    window;
  };

  return selectedTags && selectedTags.length > 0 ? (
    <div className={styles.filterAppliedBar}>
      <Body1>Filters applied:</Body1>
      {selectedTags
        .map((tag) => {
          const tagObject = Tags[tag];

          // Safety check: skip if tag doesn't exist in Tags object
          if (!tagObject) {
            return null;
          }

          return (
            <Badge
              key={tag}
              appearance="filled"
              size="extra-large"
              color="brand"
              shape="circular"
              icon={<Dismiss20Filled />}
              iconPosition="after"
              onClick={() => {
                toggleTag(tag, location);
              }}
            >
              {tagObject.label}
            </Badge>
          );
        })
        .filter(Boolean)}{" "}
      {/* Filter out null elements */}
      <div className={styles.clearAll} onClick={clearAll}>
        Clear all
      </div>
    </div>
  ) : null;
}

// Search box
function FilterBar(): React.JSX.Element {
  const history = useHistory();
  const location = useLocation();
  const [value, setValue] = useState<string | null>(null);
  useEffect(() => {
    setValue(readSearchName(location.search));
  }, [location]);
  InputValue = value;

  return (
    <SearchBox
      className={styles.searchBox}
      id="filterBar"
      appearance="outline"
      size="large"
      value={readSearchName(location.search) != null ? value : ""}
      placeholder="Search Resources"
      onChange={(e) => {
        if (!e) {
          return;
        }
        // Only handle if the event target is an input
        const target = e.currentTarget as HTMLInputElement;
        setValue(target.value);
        const newSearch = new URLSearchParams(location.search);
        newSearch.delete(SearchNameQueryKey);
        if (target.value) {
          newSearch.set(SearchNameQueryKey, target.value);
        }
        history.push({
          ...location,
          search: newSearch.toString(),
          state: prepareUserState(),
        });
      }}
    />
  );
}

function filterUsers(
  users: User[],
  selectedTags: TagType[],
  searchName: string | null,
) {
  if (searchName) {
    // eslint-disable-next-line no-param-reassign
    users = users.filter((user) =>
      user.title.toLowerCase().includes(searchName.toLowerCase()),
    );
  }
  if (!selectedTags || selectedTags.length === 0) {
    return users;
  }

  // Group tags by their accordion/category type for OR/AND logic:
  // - Within same accordion (type): OR logic (video OR blog shows both)
  // - Across different accordions: AND logic (ResourceType AND Service must both match)

  // Helper to get the primary type of a tag (for grouping purposes)
  const getTagCategory = (tag: TagType): string => {
    const tagObject = Tags[tag];
    if (!tagObject) return "Other";

    const tagType = tagObject.type;
    if (Array.isArray(tagType)) {
      // Use first type for grouping
      return tagType[0] || "Other";
    }
    return tagType || "Other";
  };

  // Group selected tags by their category/accordion type
  const tagsByCategory = new Map<string, TagType[]>();

  selectedTags.forEach((tag) => {
    const category = getTagCategory(tag);
    if (!tagsByCategory.has(category)) {
      tagsByCategory.set(category, []);
    }
    tagsByCategory.get(category)!.push(tag);
  });

  // Expand parent tags to include their sub-tags for OR matching
  const expandedTagsByCategory = new Map<string, TagType[]>();

  Array.from(tagsByCategory.entries()).forEach(([category, tags]) => {
    const expandedTags: TagType[] = [];

    tags.forEach((tag) => {
      expandedTags.push(tag);

      const tagObject = Tags[tag];
      if (
        tagObject &&
        Array.isArray(tagObject.subType) &&
        tagObject.subType.length > 0
      ) {
        // Special-cases: don't expand certain parent tags
        if (
          tag !== ("fundamentals" as TagType) &&
          tag !== ("genai" as TagType) &&
          tag !== ("app-dev" as TagType)
        ) {
          // Add sub-tags from parent tag for OR matching
          tagObject.subType.forEach((sub) => {
            const subTagKey = sub.label.toLowerCase() as TagType;
            if (Tags[subTagKey] && !expandedTags.includes(subTagKey)) {
              expandedTags.push(subTagKey);
            }
          });
        }
      }
    });

    expandedTagsByCategory.set(category, expandedTags);
  });

  return users.filter((user) => {
    if (!user || !user.tags || user.tags.length === 0) {
      return false;
    }

    // AND logic across categories: user must satisfy ALL category groups
    // OR logic within category: user must have at least ONE tag from each category group
    const categoryEntries = Array.from(expandedTagsByCategory.entries());
    return categoryEntries.every(([category, categoryTags]) => {
      // Check if user has at least one tag from this category (OR within category)
      return categoryTags.some((tag) => user.tags.includes(tag));
    });
  });
}

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
}: {
  setActiveTags: React.Dispatch<React.SetStateAction<TagType[]>>;
  activeTags: TagType[];
  selectedTags: TagType[];
  location;
  setSelectedTags: React.Dispatch<React.SetStateAction<TagType[]>>;
  setSelectedCheckbox: React.Dispatch<React.SetStateAction<TagType[]>>;
  selectedCheckbox: TagType[];
  readSearchTags: (search: string) => TagType[];
  replaceSearchTags: (search: string, newTags: TagType[]) => string;
}) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([
    SORT_BY_OPTIONS[1],
  ]);
  const [viewType, setViewType] = useState<"grid" | "list">("grid");
  const [sortOption, setSortOption] = useState<string>(SORT_BY_OPTIONS[1]);
  const [loading, setLoading] = useState(true);
  const [searchName, setSearchName] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const history = useHistory();
  const searchParams = new URLSearchParams(location.search);
  const clearAll = () => {
    setSelectedTags([]);
    setSelectedCheckbox([]);
    searchParams.delete("tags");
    history.push({
      ...location,
      search: searchParams.toString(),
      state: prepareUserState(),
    });
  };

  useEffect(() => {
    setSelectedTags(readSearchTags(location.search));
    setSelectedUsers(readSortChoice(sortOption));
    setSearchName(readSearchName(location.search));
    restoreUserState(location.state);
    setLoading(false);
  }, [location, sortOption]);

  // Listen for custom event to switch to list view (used by other components)
  React.useEffect(() => {
    const handler = () => setViewType("list");
    window.addEventListener("switchToListView", handler);
    return () => window.removeEventListener("switchToListView", handler);
  }, []);

  var cards = useMemo(
    () => filterUsers(selectedUsers, selectedTags, searchName),
    [selectedUsers, selectedTags, searchName],
  );

  useEffect(() => {
    const unionTags = new Set<TagType>();
    cards.forEach((user) => user.tags.forEach((tag) => unionTags.add(tag)));

    // If a parent tag is selected, ensure its sub-tags are also in activeTags
    // This enables sub-filters when parent is checked
    selectedTags.forEach((selectedTag) => {
      const tagObject = Tags[selectedTag];
      if (
        tagObject &&
        Array.isArray(tagObject.subType) &&
        tagObject.subType.length > 0
      ) {
        tagObject.subType.forEach((sub) => {
          const subTagKey = sub.label.toLowerCase() as TagType;
          if (Tags[subTagKey]) {
            unionTags.add(subTagKey);
          }
        });
      }
    });

    // Helper to get the primary type/category of a tag
    const getTagCategory = (tag: TagType): string => {
      const tagObject = Tags[tag];
      if (!tagObject) return "Other";
      const tagType = tagObject.type;
      if (Array.isArray(tagType)) {
        return tagType[0] || "Other";
      }
      return tagType || "Other";
    };

    // Get categories that have selected tags
    const selectedCategories = new Set<string>();
    selectedTags.forEach((tag) => {
      selectedCategories.add(getTagCategory(tag));
    });

    // For OR logic within same category: keep ALL tags in categories that have selections enabled
    // This prevents disabling other options when one is selected (since OR means more = more results)
    if (selectedCategories.size > 0) {
      Object.keys(Tags).forEach((tagKey) => {
        const tag = tagKey as TagType;
        const category = getTagCategory(tag);
        if (selectedCategories.has(category)) {
          // This tag is in a category with selections - keep it enabled
          unionTags.add(tag);
        }
      });
    }

    setActiveTags(Array.from(unionTags));
  }, [cards, selectedTags]);

  const sortByOnSelect = (event, data) => {
    setLoading(true);
    setSelectedOptions(data.selectedOptions);
    setSortOption(data.selectedOptions[0] || SORT_BY_OPTIONS[1]);
  };
  const templateNumber = cards ? cards.length : 0;
  const filterCount = selectedTags.length;

  // Adobe Analytics Content
  const contentForAdobeAnalytics = `{\"cN\":\"Searchbox\"}`;

  return (
    <>
      <div>
        <div className={styles.titleSection}>
          <Title1 className={styles.resourceTitle}>Resource Library</Title1>
          <Title3 className={styles.centeredDescription}>
            Explore our comprehensive collection of documentation, tutorials,
            videos, and solution accelerators to help you build amazing
            applications with PostgreSQL on Azure.
          </Title3>
        </div>
        <div className={styles.searchAndSortBarSection}>
          <FilterBar data-m={contentForAdobeAnalytics} />
          <div className={styles.sortAndViewBar}>
            <Dropdown
              className={styles.sortBar}
              value={sortOption}
              aria-labelledby="dropdown-default"
              appearance="outline"
              size="large"
              onOptionSelect={sortByOnSelect}
            >
              {SORT_BY_OPTIONS.map((option) => (
                <Option key={option}>{option}</Option>
              ))}
            </Dropdown>
            <div className={styles.viewButtons}>
              <button
                className={`${styles.iconButton} ${
                  viewType === "grid" ? styles.activeIconButton : ""
                }`}
                aria-label="Grid View"
                onClick={() => setViewType("grid")}
              >
                <Grid3x3
                  color={viewType === "grid" ? "#fff" : "#2e76bb"}
                  size={20}
                  strokeWidth={2}
                />
              </button>
              <button
                className={`${styles.iconButton} ${
                  viewType === "list" ? styles.activeIconButton : ""
                }`}
                aria-label="List View"
                onClick={() => setViewType("list")}
              >
                <List
                  color={viewType === "list" ? "#fff" : "#2e76bb"}
                  size={20}
                  strokeWidth={2}
                />
              </button>
            </div>
          </div>
        </div>
        <div className={styles.templateResultsNumberContainer}>
          <div className={styles.templateResultsNumber}>
            <Text size={400}>Showing</Text>
            <Text size={400} weight="bold">
              {templateNumber}
            </Text>
            {templateNumber != 1 ? (
              <Text size={400}>resources</Text>
            ) : (
              <Text size={400}>resource</Text>
            )}
            {InputValue != null ? (
              <>
                <Text size={400}>for</Text>
                <Text size={400} weight="bold">
                  '{InputValue}'
                </Text>
              </>
            ) : null}
          </div>
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
        clearAll={clearAll}
        selectedTags={selectedTags}
        readSearchTags={readSearchTags}
        replaceSearchTags={replaceSearchTags}
      />
      {loading ? (
        <Spinner labelPosition="below" label="Loading..." />
      ) : viewType === "grid" ? (
        <ShowcaseCards filteredUsers={cards} coverPage={false} />
      ) : (
        <ShowcaseList
          filteredUsers={cards}
          key={cards.map((u) => u.title).join("-")}
        />
      )}
    </>
  );
}

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
    // Sort by priority: P0 > P1 > P2, then by original order
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

      // If priorities are equal, sort by original order
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
    const newTags = toggleListItem(tags, tag);
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
  searchName: string | null
) {
  if (searchName) {
    // eslint-disable-next-line no-param-reassign
    users = users.filter((user) =>
      user.title.toLowerCase().includes(searchName.toLowerCase())
    );
  }
  if (!selectedTags || selectedTags.length === 0) {
    return users;
  }

  // Detect parent-sub-tag pairs that require AND logic
  // If both a parent and one of its sub-tags are selected, they require AND
  const parentSubPairs = new Map<TagType, TagType>(); // Map<parent, subTag>

  selectedTags.forEach((selectedTag) => {
    // Check if this selected tag is a parent that has sub-tags
    const tagObject = Tags[selectedTag];
    if (
      tagObject &&
      Array.isArray(tagObject.subType) &&
      tagObject.subType.length > 0
    ) {
      // Check if any of its sub-tags are also selected
      tagObject.subType.forEach((sub) => {
        const subTagKey = sub.label.toLowerCase() as TagType;
        if (selectedTags.includes(subTagKey)) {
          // Both parent and sub-tag are selected - require AND logic
          parentSubPairs.set(selectedTag, subTagKey);
        }
      });
    }
  });

  // Create tag groups with special handling for parent-sub pairs
  const tagGroups: Array<{ tags: TagType[]; requireAll: boolean }> = [];
  const processedTags = new Set<TagType>();

  // Special-case AND relation for Connect & Query: require both 'app-dev' and 'connect'
  if (selectedTags.includes("app-dev" as TagType) && selectedTags.includes("connect" as TagType)) {
    tagGroups.push({ tags: ["app-dev" as TagType, "connect" as TagType], requireAll: true });
    processedTags.add("app-dev" as TagType);
    processedTags.add("connect" as TagType);
  }

  selectedTags.forEach((tag) => {
    if (processedTags.has(tag)) {
      return; // Already processed as part of a parent-sub pair
    }

    // Check if this tag is part of a parent-sub pair
    let isInPair = false;
    for (const [parent, subTag] of Array.from(parentSubPairs.entries())) {
      if (tag === parent || tag === subTag) {
        // This is a parent-sub pair requiring AND logic
        tagGroups.push({
          tags: [parent, subTag],
          requireAll: true, // Require both tags
        });
        processedTags.add(parent);
        processedTags.add(subTag);
        isInPair = true;
        break;
      }
    }

    if (!isInPair) {
      // Regular tag - create group with parent expansion (OR logic)
      const tagObject = Tags[tag];
      const group: TagType[] = [tag];

      if (
        tagObject &&
        Array.isArray(tagObject.subType) &&
        tagObject.subType.length > 0
      ) {
        // Special-case: Do NOT expand Fundamentals to include its subtypes.
        // Fundamentals should match only items explicitly tagged with 'fundamentals'.
        if (tag !== ("fundamentals" as TagType)) {
          // Add sub-tags from parent tag (but only if sub-tag isn't already selected separately)
          tagObject.subType.forEach((sub) => {
            const subTagKey = sub.label.toLowerCase() as TagType;
            if (Tags[subTagKey] && !selectedTags.includes(subTagKey)) {
              // Only include sub-tag in expansion if it's not explicitly selected
              group.push(subTagKey);
            }
          });
        }
      }

      tagGroups.push({
        tags: group,
        requireAll: false, // OR logic within group
      });
      processedTags.add(tag);
    }
  });

  return users.filter((user) => {
    if (!user && !user.tags && user.tags.length === 0) {
      return false;
    }
    // For each tag group:
    // - If requireAll is true (parent-sub pair), user must have ALL tags in the group
    // - If requireAll is false, user must have at least one tag from the group
    // AND user must satisfy all groups (AND between groups)
    return tagGroups.every((group) => {
      if (group.requireAll) {
        // AND logic: user must have all tags in this group
        return group.tags.every((tag) => user.tags.includes(tag));
      } else {
        // OR logic: user must have at least one tag from this group
        return group.tags.some((tag) => user.tags.includes(tag));
      }
    });
  });
}

export default function ShowcaseCardPage({
  setActiveTags,
  selectedTags,
  location,
  setSelectedTags,
  setSelectedCheckbox,
  readSearchTags,
  replaceSearchTags,
}: {
  setActiveTags: React.Dispatch<React.SetStateAction<TagType[]>>;
  selectedTags: TagType[];
  location;
  setSelectedTags: React.Dispatch<React.SetStateAction<TagType[]>>;
  setSelectedCheckbox: React.Dispatch<React.SetStateAction<TagType[]>>;
  readSearchTags: (search: string) => TagType[];
  replaceSearchTags: (search: string, newTags: TagType[]) => string;
}) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
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
    setSelectedUsers(readSortChoice(selectedOptions[0]));
    setSearchName(readSearchName(location.search));
    restoreUserState(location.state);
    setLoading(false);
  }, [location, selectedOptions]);

  var cards = useMemo(
    () => filterUsers(selectedUsers, selectedTags, searchName),
    [selectedUsers, selectedTags, searchName]
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

    setActiveTags(Array.from(unionTags));
  }, [cards, selectedTags]);

  const sortByOnSelect = (event, data) => {
    setLoading(true);
    setSelectedOptions(data.selectedOptions);
  };
  const templateNumber = cards ? cards.length : 0;

  // Adobe Analytics Content
  const contentForAdobeAnalytics = `{\"cN\":\"Searchbox\"}`;

  const [viewType, setViewType] = useState<"grid" | "list">("grid");
  // Listen for custom event to switch to list view
  React.useEffect(() => {
    const handler = () => setViewType("list");
    window.addEventListener("switchToListView", handler);
    return () => window.removeEventListener("switchToListView", handler);
  }, []);

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
              defaultValue={SORT_BY_OPTIONS[0]}
              aria-labelledby="dropdown-default"
              appearance="outline"
              size="large"
              placeholder={SORT_BY_OPTIONS[2]}
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
        <div className={styles.templateResultsNumber}>
          <Text size={400}>Showing</Text>
          <Text size={400} weight="bold">
            {templateNumber}
          </Text>
          {templateNumber != 1 ? (
            <Text size={400}>resources</Text>
          ) : (
            <Text size={400}>resources</Text>
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

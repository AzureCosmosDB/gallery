/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useHistory, useLocation } from "@docusaurus/router";
import { Tags, type User, type TagType } from "../data/tags-copy";
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
    const copyUnsortedUser = unsortedUsers.slice();
    return copyUnsortedUser.reverse();
  } else if (rule == SORT_BY_OPTIONS[1]) {
    return unsortedUsers;
  }
  return sortedUsers;
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
    console.log(window);
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
      {selectedTags.map((tag, index) => {
        const tagObject = Tags[tag];
        const key = `showcase_checkbox_key_${tag}`;
        const id = `showcase_checkbox_id_${tag}`;

        return (
          <Badge
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
      })}
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
  return users.filter((user) => {
    if (!user && !user.tags && user.tags.length === 0) {
      return false;
    }
    return selectedTags.every((tag) => user.tags.includes(tag));
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
    setActiveTags(Array.from(unionTags));
  }, [cards]);

  const sortByOnSelect = (event, data) => {
    setLoading(true);
    setSelectedOptions(data.selectedOptions);
    console.log("@@selected drop", data);
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
          <Title1 style={{ fontWeight: 700 }}>Resource Library</Title1>
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

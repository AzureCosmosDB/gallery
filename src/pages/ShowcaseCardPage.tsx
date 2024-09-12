/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useHistory, useLocation } from "@docusaurus/router";
import { Tags, type User, type TagType } from "../data/tags";
import { sortedUsers, unsortedUsers } from "../data/users";
import { Text, Option, Spinner, Badge, Body1, Dropdown } from "@fluentui/react-components";
import { SearchBox } from '@fluentui/react-search';
import ShowcaseCards from "./ShowcaseCards";
import styles from "./styles.module.css";
import { toggleListItem } from "@site/src/utils/jsUtils";
import { prepareUserState } from "@site/src/pages/index";
import { Dismiss20Filled } from "@fluentui/react-icons";

function restoreUserState(userState: UserState | null) {
  const { scrollTopPosition, focusedElementId } = userState ?? {
    scrollTopPosition: 0,
    focusedElementId: undefined,
  };
  // @ts-expect-error: if focusedElementId is undefined it returns null
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

const SORT_BY_OPTIONS = [
  "New to old",
  "Old to new",
  "Alphabetical (A - Z)",
  "Alphabetical (Z - A)",
];

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
  } else if (rule == SORT_BY_OPTIONS[2]) {
    return sortedUsers;
  } else if (rule == SORT_BY_OPTIONS[3]) {
    const copySortedUser = sortedUsers.slice();
    return copySortedUser.reverse();
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
    history.push({
      ...location,
      search: newSearch,
      state: prepareUserState(),
    });
  }

  return selectedTags && selectedTags.length > 0 ? (
    <div className={styles.filterAppliedBar}>
      <Body1>
        Filters applied:
      </Body1>
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
    <>
      <SearchBox
        className={styles.searchBox}
        id="filterBar"
        appearance="outline"
        size="large"
        value={readSearchName(location.search) != null ? value : ""}
        placeholder="Search templates"
        onClear={(e) => {
          setValue(null);
          const newSearch = new URLSearchParams(location.search);
          newSearch.delete(SearchNameQueryKey);

          history.push({
            ...location,
            search: newSearch.toString(),
            state: prepareUserState(),
          });
        }}
        onChange={(e) => {
          if (!e) {
            return;
          }
          setValue(e.currentTarget.value);
          const newSearch = new URLSearchParams(location.search);
          newSearch.delete(SearchNameQueryKey);
          if (e.currentTarget.value) {
            newSearch.set(SearchNameQueryKey, e.currentTarget.value);
          }
          history.push({
            ...location,
            search: newSearch.toString(),
            state: prepareUserState(),
          });
          setTimeout(() => {
            document.getElementById("searchbar")?.focus();
          }, 0);
        }}
      />
    </>
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
    cards.forEach(user => user.tags.forEach(tag => unionTags.add(tag)));
    setActiveTags(Array.from(unionTags));
  }, [cards]);

  const sortByOnSelect = (event, data) => {
    setLoading(true);
    setSelectedOptions(data.selectedOptions);
  };
  const templateNumber = cards ? cards.length : 0;

  // Adobe Analytics Content
  const contentForAdobeAnalytics = `{\"cN\":\"Searchbox\"}`;

  return (
    <>
      <div>
        <div className={styles.searchAndSortBarSection}>
          <FilterBar data-m={contentForAdobeAnalytics} />
          <Dropdown
            className={styles.sortBar}
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
        </div>
        <div className={styles.templateResultsNumber}>
          <Text size={400}>Showing</Text>
          <Text size={400} weight="bold">
            {templateNumber}
          </Text>
          {templateNumber != 1 ? (
            <Text size={400}>templates</Text>
          ) : (
            <Text size={400}>template</Text>
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
        setSelectedTags={setSelectedTags}
        readSearchTags={readSearchTags}
        replaceSearchTags={replaceSearchTags}
      />
      {loading ? (
        <Spinner labelPosition="below" label="Loading..." />
      ) : (
        <ShowcaseCards filteredUsers={cards} coverPage={false} />
      )}
    </>
  );
}

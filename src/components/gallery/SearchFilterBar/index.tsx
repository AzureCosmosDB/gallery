/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 *
 * SearchFilterBar - Search box for filtering resources by name.
 */

import React, { useState, useEffect } from "react";
import { useHistory, useLocation } from "@docusaurus/router";
import { SearchBox } from "@fluentui/react-search";
import { prepareUserState } from "../../../pages/index";
import styles from "../../../pages/styles.module.css";

const SEARCH_NAME_QUERY_KEY = "name";

/**
 * Reads the search name from URL search params.
 */
export function readSearchName(search: string): string | null {
  return new URLSearchParams(search).get(SEARCH_NAME_QUERY_KEY);
}

export interface SearchFilterBarProps {
  /** Optional data attribute for analytics */
  "data-m"?: string;
}

/**
 * Search box component for filtering resources by title.
 * Updates URL search params on change.
 */
export default function SearchFilterBar(
  props: SearchFilterBarProps,
): React.JSX.Element {
  const history = useHistory();
  const location = useLocation();
  const [value, setValue] = useState<string | null>(null);

  useEffect(() => {
    setValue(readSearchName(location.search));
  }, [location]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement> | null) => {
    if (!e) return;

    const target = e.currentTarget;
    const newValue = target.value;
    setValue(newValue);

    const newSearch = new URLSearchParams(location.search);
    newSearch.delete(SEARCH_NAME_QUERY_KEY);

    if (newValue) {
      newSearch.set(SEARCH_NAME_QUERY_KEY, newValue);
    }

    history.push({
      ...location,
      search: newSearch.toString(),
      state: prepareUserState(),
    });
  };

  const displayValue =
    readSearchName(location.search) != null ? (value ?? "") : "";

  return (
    <SearchBox
      className={styles.searchBox}
      id="filterBar"
      appearance="outline"
      size="large"
      value={displayValue}
      placeholder="Search Resources"
      onChange={handleChange}
      {...props}
    />
  );
}

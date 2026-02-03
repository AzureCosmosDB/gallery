/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 *
 * SortDropdown - Dropdown for selecting sort order.
 */

import React from "react";
import { Dropdown, Option } from "@fluentui/react-components";
import { SORT_BY_OPTIONS } from "../../../utils/sortingUtils";
import styles from "../../../pages/styles.module.css";

interface SortDropdownProps {
  /** Current sort option */
  sortOption: string;
  /** Callback when sort option changes */
  onSortChange: (option: string) => void;
  /** Whether a loading state should be triggered */
  setLoading?: (loading: boolean) => void;
}

/**
 * Dropdown component for selecting sort order.
 */
export default function SortDropdown({
  sortOption,
  onSortChange,
  setLoading,
}: SortDropdownProps): React.JSX.Element {
  const handleOptionSelect = (
    _event: unknown,
    data: { selectedOptions: string[] },
  ) => {
    if (setLoading) {
      setLoading(true);
    }
    onSortChange(data.selectedOptions[0] || SORT_BY_OPTIONS[1]);
  };

  return (
    <Dropdown
      className={styles.sortBar}
      value={sortOption}
      aria-labelledby="dropdown-default"
      appearance="outline"
      size="large"
      onOptionSelect={handleOptionSelect}
    >
      {SORT_BY_OPTIONS.map((option) => (
        <Option key={option}>{option}</Option>
      ))}
    </Dropdown>
  );
}

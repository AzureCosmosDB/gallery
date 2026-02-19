/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 *
 * ResultsSummary - Displays the count of resources shown.
 */

import React from "react";
import { Text } from "@fluentui/react-components";
import styles from "../../../home/styles.module.css";

export interface ResultsSummaryProps {
  /** Number of resources shown */
  count: number;
  /** Current search term (if any) */
  searchTerm: string | null;
}

/**
 * Displays "Showing X resources" with optional search term.
 */
export default function ResultsSummary({
  count,
  searchTerm,
}: ResultsSummaryProps): React.JSX.Element {
  const resourceWord = count === 1 ? "resource" : "resources";

  return (
    <div className={styles.templateResultsNumber}>
      <Text size={400}>Showing</Text>
      <Text size={400} weight="bold">
        {count}
      </Text>
      <Text size={400}>{resourceWord}</Text>
      {searchTerm != null && (
        <>
          <Text size={400}>for</Text>
          <Text size={400} weight="bold">
            '{searchTerm}'
          </Text>
        </>
      )}
    </div>
  );
}

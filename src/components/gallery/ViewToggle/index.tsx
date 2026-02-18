/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 *
 * ViewToggle - Toggle between grid and list view.
 */

import React from 'react';
import { Grid3x3, List } from 'lucide-react';
import styles from '../../home/styles.module.css';

export type ViewType = 'grid' | 'list';

export interface ViewToggleProps {
  /** Current view type */
  viewType: ViewType;
  /** Callback when view type changes */
  onViewChange: (viewType: ViewType) => void;
}

const ACTIVE_COLOR = '#fff';
const INACTIVE_COLOR = '#2e76bb';

/**
 * Toggle buttons for switching between grid and list views.
 */
export default function ViewToggle({ viewType, onViewChange }: ViewToggleProps): React.JSX.Element {
  return (
    <div className={styles.viewButtons}>
      <button
        className={`${styles.iconButton} ${viewType === 'grid' ? styles.activeIconButton : ''}`}
        aria-label="Grid View"
        onClick={() => onViewChange('grid')}
        type="button"
      >
        <Grid3x3
          color={viewType === 'grid' ? ACTIVE_COLOR : INACTIVE_COLOR}
          size={20}
          strokeWidth={2}
        />
      </button>
      <button
        className={`${styles.iconButton} ${viewType === 'list' ? styles.activeIconButton : ''}`}
        aria-label="List View"
        onClick={() => onViewChange('list')}
        type="button"
      >
        <List
          color={viewType === 'list' ? ACTIVE_COLOR : INACTIVE_COLOR}
          size={20}
          strokeWidth={2}
        />
      </button>
    </div>
  );
}

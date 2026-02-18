import React from 'react';
import SearchFilterBar from '../../../../resource-library/filters/SearchFilterBar';
import SortDropdown from '../../../../resource-library/filters/SortDropdown';
import ViewToggle, { type ViewType } from '../../../../resource-library/filters/ViewToggle';
import styles from '../../../styles.module.css';

type Props = {
  sortOption: string;
  onSortChange: (o: string) => void;
  viewType: ViewType;
  onViewChange: (v: ViewType) => void;
  setLoading?: (v: boolean) => void; // optional if you still need it
};

export function ControlsBar({
  sortOption,
  onSortChange,
  viewType,
  onViewChange,
  setLoading,
}: Props) {
  const analyticsData = `{"cN":"Searchbox"}`;

  return (
    <div className={styles.searchAndSortBarSection}>
      <SearchFilterBar data-m={analyticsData} />
      <div className={styles.sortAndViewBar}>
        <SortDropdown sortOption={sortOption} onSortChange={onSortChange} setLoading={setLoading} />
        <ViewToggle viewType={viewType} onViewChange={onViewChange} />
      </div>
    </div>
  );
}

import React from "react";
import ResultsSummary from "../../../../components/gallery/ResultsSummary";
import MobileFilterDrawer from "../../../../components/gallery/MobileFilterDrawer";
import styles from "../../../styles.module.css";
import type { TagType } from "../../../../data/tags";

type Props = {
  resourceCount: number;
  searchName: string | null;
  filterCount: number;

  activeTags: TagType[];
  selectedCheckbox: TagType[];
  setSelectedCheckbox: React.Dispatch<React.SetStateAction<TagType[]>>;
  selectedTags: TagType[];
  setSelectedTags: React.Dispatch<React.SetStateAction<TagType[]>>;
  location: any;

  readSearchTags: (search: string) => TagType[];
  replaceSearchTags: (search: string, newTags: TagType[]) => string;

  sortOption: string;
  setSortOption: (v: string) => void;
};

export function ResultsBar(props: Props) {
  const {
    resourceCount,
    searchName,
    filterCount,
    activeTags,
    selectedCheckbox,
    setSelectedCheckbox,
    location,
    selectedTags,
    setSelectedTags,
    readSearchTags,
    replaceSearchTags,
    sortOption,
    setSortOption,
  } = props;

  return (
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
  );
}

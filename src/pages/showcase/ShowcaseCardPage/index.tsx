import React, { useState, useEffect } from "react";
import styles from "../../styles.module.css";

import FilterAppliedBar from "../../../components/gallery/FilterAppliedBar";
import { useViewType } from "./hooks/useViewType";
import { useResourceLibraryController } from "./hooks/useResourceLibraryController";

import { HeaderSection } from "./sections/HeaderSection";
import { ControlsBar } from "./sections/ControlsBar";
import { ResultsBar } from "./sections/ResultsBar";
import { ResourceContent } from "./sections/ResourceContent";

import type { ShowcaseCardPageProps } from "./types";

export default function ShowcaseCardPage(props: ShowcaseCardPageProps) {
  const [loading, setLoading] = useState(true);

  const [viewType, setViewType] = useViewType("grid");
  const controller = useResourceLibraryController(props);

  useEffect(() => setLoading(false), []);

  return (
    <>
      <div className={styles.pageHeaderArea}>
        <HeaderSection />

        <ControlsBar
          sortOption={controller.sortOption}
          onSortChange={controller.handleSortChange}
          setLoading={setLoading}
          viewType={viewType}
          onViewChange={setViewType}
        />

        <ResultsBar
          resourceCount={controller.resourceCount}
          searchName={controller.searchName}
          filterCount={controller.filterCount}
          activeTags={props.activeTags}
          selectedCheckbox={props.selectedCheckbox}
          setSelectedCheckbox={props.setSelectedCheckbox}
          location={props.location}
          selectedTags={props.selectedTags}
          setSelectedTags={props.setSelectedTags}
          readSearchTags={props.readSearchTags}
          replaceSearchTags={props.replaceSearchTags}
          sortOption={controller.sortOption}
          setSortOption={controller.setSortOption}
        />
      </div>

      <FilterAppliedBar
        selectedTags={props.selectedTags}
        onClearAll={controller.handleClearAll}
        readSearchTags={props.readSearchTags}
        replaceSearchTags={props.replaceSearchTags}
      />

      <ResourceContent
        loading={loading}
        viewType={viewType}
        cards={controller.cards}
      />
    </>
  );
}

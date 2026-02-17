import { useEffect, useMemo, useState } from "react";
import { useHistory } from "@docusaurus/router";
import { SORT_BY_OPTIONS, getSortedUsers } from "../../../utils/sortingUtils";
import { filterUsers, computeActiveTags } from "../../../utils/filterUtils";
import { restoreUserState } from "../utils/restoreUserState";
import { prepareUserState } from "../../index";
import { readSearchName } from "../../../components/gallery/SearchFilterBar";
import type { ShowcaseCardPageProps } from "../types";

export function useResourceLibraryController(props: ShowcaseCardPageProps) {
  const {
    location,
    selectedTags,
    setSelectedTags,
    setSelectedCheckbox,
    setActiveTags,
    readSearchTags,
  } = props;

  const history = useHistory();

  const [sortOption, setSortOption] = useState<string>(SORT_BY_OPTIONS[1]);
  const [searchName, setSearchName] = useState<string | null>(null);

  const sortedUsers = useMemo(() => getSortedUsers(sortOption), [sortOption]);

  const cards = useMemo(
    () => filterUsers(sortedUsers, selectedTags, searchName),
    [sortedUsers, selectedTags, searchName],
  );

  useEffect(() => {
    setSelectedTags(readSearchTags(location.search));
    setSearchName(readSearchName(location.search));
    restoreUserState(location.state ?? null);
  }, [location.search, location.state, readSearchTags, setSelectedTags]);

  useEffect(() => {
    setActiveTags(computeActiveTags(cards, selectedTags));
  }, [cards, selectedTags, setActiveTags]);

  const handleClearAll = () => {
    setSelectedTags([]);
    setSelectedCheckbox([]);

    const params = new URLSearchParams(location.search);
    params.delete("tags");

    history.push({
      pathname: location.pathname,
      search: params.toString() ? `?${params.toString()}` : "",
      state: prepareUserState(),
    });
  };

  return {
    sortOption,
    setSortOption,
    searchName,
    cards,
    resourceCount: cards.length,
    filterCount: selectedTags.length,
    handleClearAll,
    handleSortChange: setSortOption,
  };
}

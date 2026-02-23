import { useEffect, useState } from "react";
import type { TagType } from "../../../../../data/tags";

const SORT_BY_OPTIONS = ["Newest", "Recommended"] as const;

export function useTempDrawerState({
  isOpen,
  selectedCheckbox,
  sortOption,
}: {
  isOpen: boolean;
  selectedCheckbox: TagType[];
  sortOption: string;
}) {
  const [tempSelectedCheckbox, setTempSelectedCheckbox] = useState<TagType[]>(selectedCheckbox);
  const [tempSortOption, setTempSortOption] = useState<string>(sortOption);

  useEffect(() => {
    if (isOpen) {
      setTempSelectedCheckbox(selectedCheckbox);
      setTempSortOption(sortOption);
    }
  }, [isOpen, selectedCheckbox, sortOption]);

  const tempFilterCount = tempSelectedCheckbox.length;

  return {
    tempSelectedCheckbox,
    setTempSelectedCheckbox,
    tempSortOption,
    setTempSortOption,
    tempFilterCount,
    SORT_BY_OPTIONS,
  };
}

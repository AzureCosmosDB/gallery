import type React from "react";
import type { TagType } from "../../../../data/tags";

export type UserState = {
  scrollTopPosition: number;
  focusedElementId?: string;
};

export interface ShowcaseCardPageProps {
  setActiveTags: React.Dispatch<React.SetStateAction<TagType[]>>;
  activeTags: TagType[];
  selectedTags: TagType[];
  location: Location & { state?: UserState };
  setSelectedTags: React.Dispatch<React.SetStateAction<TagType[]>>;
  setSelectedCheckbox: React.Dispatch<React.SetStateAction<TagType[]>>;
  selectedCheckbox: TagType[];
  readSearchTags: (search: string) => TagType[];
  replaceSearchTags: (search: string, newTags: TagType[]) => string;
}

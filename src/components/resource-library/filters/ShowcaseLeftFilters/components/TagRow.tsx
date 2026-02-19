import React from 'react';
import ShowcaseTagSelect from '../../../tags/ShowcaseTagSelect';
import type { TagType } from '../../../../../data/tags';
import type { Location } from '@docusaurus/router';

export function TagRow({
  id,
  tag,
  label,
  activeTags,
  selectedCheckbox,
  setSelectedCheckbox,
  location,
  readSearchTags,
  replaceSearchTags,
  parentTag,
}: {
  id: string;
  tag: TagType;
  label: string;
  activeTags: TagType[];
  selectedCheckbox: TagType[];
  setSelectedCheckbox: React.Dispatch<React.SetStateAction<TagType[]>>;
  location: Location;
  readSearchTags: (search: string) => TagType[];
  replaceSearchTags: (search: string, newTags: TagType[]) => string;
  parentTag?: TagType;
}) {
  return (
    <ShowcaseTagSelect
      id={id}
      tag={tag}
      label={label}
      activeTags={activeTags}
      selectedCheckbox={selectedCheckbox}
      setSelectedCheckbox={setSelectedCheckbox}
      location={location}
      readSearchTags={readSearchTags}
      replaceSearchTags={replaceSearchTags}
      parentTag={parentTag}
    />
  );
}

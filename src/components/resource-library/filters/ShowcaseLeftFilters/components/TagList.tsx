import React, { useState } from 'react';
import { Tags, type TagType } from '../../../../../data/tags';
import type { Location } from '@docusaurus/router';
import { TagRow } from './TagRow';
import { LearningPathTagRow } from './LearningPathTagRow';
import { NestedTagRow } from './NestedTagRow';
import styles from '../styles.module.css';

export function TagList({
  tags,
  activeTags,
  selectedCheckbox,
  setSelectedCheckbox,
  location,
  readSearchTags,
  replaceSearchTags,
  isLearningPath = false,
}: {
  tags: TagType[];
  activeTags: TagType[];
  selectedCheckbox: TagType[];
  setSelectedCheckbox: React.Dispatch<React.SetStateAction<TagType[]>>;
  location: Location;
  readSearchTags: (search: string) => TagType[];
  replaceSearchTags: (search: string, newTags: TagType[]) => string;
  isLearningPath?: boolean;
}) {
  const [openInner, setOpenInner] = useState<string[]>([]);

  return (
    <>
      {tags.map((tag) => {
        const tagObject = Tags[tag];
        const key = `showcase_checkbox_key_${tag}`;
        const id = `showcase_checkbox_id_${tag}`;
        const hasSubTags = Array.isArray(tagObject.subType) && tagObject.subType.length > 0;

        if (hasSubTags) {
          return (
            <NestedTagRow
              key={key}
              tag={tag}
              openInner={openInner}
              setOpenInner={setOpenInner}
              activeTags={activeTags}
              selectedCheckbox={selectedCheckbox}
              setSelectedCheckbox={setSelectedCheckbox}
              location={location}
              readSearchTags={readSearchTags}
              replaceSearchTags={replaceSearchTags}
              isLearningPath={isLearningPath}
            />
          );
        }

        return (
          <div key={key} className={styles.checkboxListItem}>
            {isLearningPath ? (
              <LearningPathTagRow
                id={id}
                tag={tag}
                label={tagObject.label}
                activeTags={activeTags}
                selectedCheckbox={selectedCheckbox}
                setSelectedCheckbox={setSelectedCheckbox}
                location={location}
                readSearchTags={readSearchTags}
                replaceSearchTags={replaceSearchTags}
              />
            ) : (
              <TagRow
                id={id}
                tag={tag}
                label={tagObject.label}
                activeTags={activeTags}
                selectedCheckbox={selectedCheckbox}
                setSelectedCheckbox={setSelectedCheckbox}
                location={location}
                readSearchTags={readSearchTags}
                replaceSearchTags={replaceSearchTags}
              />
            )}
          </div>
        );
      })}
    </>
  );
}

import React from 'react';
import { AccordionHeader, AccordionItem, AccordionPanel } from '@fluentui/react-components';
import type { TagType } from '../../../../../data/tags';
import type { Location } from 'history';
import { TagList } from './TagList';
import { adobeTagCategoryData } from '../utils/analytics';
import styles from '../styles.module.css';

export function TagGroupAccordion({
  value,
  title,
  categoryId,
  tags,
  activeTags,
  selectedCheckbox,
  setSelectedCheckbox,
  location,
  readSearchTags,
  replaceSearchTags,
  isLearningPath = false,
}: {
  value: string;
  title: string;
  categoryId: string;
  tags: TagType[];
  activeTags: TagType[];
  selectedCheckbox: TagType[];
  setSelectedCheckbox: React.Dispatch<React.SetStateAction<TagType[]>>;
  location: Location;
  readSearchTags: (search: string) => TagType[];
  replaceSearchTags: (search: string, newTags: TagType[]) => string;
  isLearningPath?: boolean;
}) {
  const hasBackground = categoryId !== 'Language';

  return (
    <AccordionItem value={value} className={styles.mainCategoryItem}>
      <AccordionHeader
        expandIconPosition="end"
        className={hasBackground ? styles.tagCatalogBackground : undefined}
      >
        <div className={styles.tagCatalog} data-m={adobeTagCategoryData(categoryId)}>
          {title}
        </div>
      </AccordionHeader>
      <AccordionPanel>
        <TagList
          tags={tags}
          activeTags={activeTags}
          selectedCheckbox={selectedCheckbox}
          setSelectedCheckbox={setSelectedCheckbox}
          location={location}
          readSearchTags={readSearchTags}
          replaceSearchTags={replaceSearchTags}
          isLearningPath={isLearningPath}
        />
      </AccordionPanel>
    </AccordionItem>
  );
}

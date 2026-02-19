/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { useState } from 'react';
import { useHistory } from '@docusaurus/router';
import {
  Drawer,
  DrawerHeader,
  DrawerHeaderTitle,
  DrawerBody,
  Button,
  Radio,
  RadioGroup,
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
} from '@fluentui/react-components';
import { Dismiss24Regular, Filter24Regular } from '@fluentui/react-icons';
import type { TagType } from '../../../../data/tags';
import { prepareUserState } from '../../../home/HomePage';
import styles from './styles.module.css';
import type { UserState } from '../../../home/sections/ResourceLibrarySection/types';
import { buildFilterSections, toggleTagWithChildren } from './utils/mobileFilters';
import { FilterSection } from './FilterSection';
import { useTempDrawerState } from './hooks/useTempDrawerState';

const SECTIONS = buildFilterSections();

interface MobileFilterDrawerProps {
  activeTags: TagType[];
  selectedCheckbox: TagType[];
  setSelectedCheckbox: React.Dispatch<React.SetStateAction<TagType[]>>;
  location: Location & { state?: UserState };
  selectedTags: TagType[];
  setSelectedTags: React.Dispatch<React.SetStateAction<TagType[]>>;
  readSearchTags: (search: string) => TagType[];
  replaceSearchTags: (search: string, newTags: TagType[]) => string;
  sortOption: string;
  setSortOption: (option: string) => void;
  filterCount: number;
}

export default function MobileFilterDrawer(props: MobileFilterDrawerProps) {
  const {
    activeTags,
    selectedCheckbox,
    setSelectedCheckbox,
    location,
    setSelectedTags,
    replaceSearchTags,
    sortOption,
    setSortOption,
    filterCount,
  } = props;

  const [isOpen, setIsOpen] = useState(false);
  const [openAccordionItems, setOpenAccordionItems] = useState<string[]>([
    'sort',
    ...SECTIONS.map((s) => s.key),
  ]);

  const history = useHistory();

  const {
    tempSelectedCheckbox,
    setTempSelectedCheckbox,
    tempSortOption,
    setTempSortOption,
    tempFilterCount,
    SORT_BY_OPTIONS,
  } = useTempDrawerState({ isOpen, selectedCheckbox, sortOption });

  const onToggleTag = (tag: TagType) => {
    setTempSelectedCheckbox((prev) => toggleTagWithChildren(prev, tag));
  };

  const handleApply = () => {
    setSelectedCheckbox(tempSelectedCheckbox);
    setSelectedTags(tempSelectedCheckbox);
    setSortOption(tempSortOption);

    const newSearch = replaceSearchTags(location.search, tempSelectedCheckbox);

    history.push({
      ...location,
      search: newSearch,
      state: prepareUserState(),
    });

    setIsOpen(false);
  };

  const handleClear = () => {
    setTempSelectedCheckbox([]);
    setTempSortOption(SORT_BY_OPTIONS[1]);
  };

  return (
    <>
      <Button
        appearance="outline"
        icon={<Filter24Regular />}
        className={styles.filterButton}
        onClick={() => setIsOpen(true)}
      >
        Filters
        {filterCount > 0 && <span className={styles.filterBadge}>{filterCount}</span>}
      </Button>

      <Drawer
        type="overlay"
        separator
        open={isOpen}
        onOpenChange={(_, { open }) => setIsOpen(open)}
        position="bottom"
        size="full"
        className={styles.mobileDrawer}
      >
        <DrawerHeader className={styles.drawerHeader}>
          <DrawerHeaderTitle
            action={
              <Button
                appearance="subtle"
                aria-label="Close"
                icon={<Dismiss24Regular />}
                onClick={() => setIsOpen(false)}
                className={styles.closeButton}
              />
            }
          >
            Filter
          </DrawerHeaderTitle>
        </DrawerHeader>

        <DrawerBody className={styles.drawerBody}>
          <div className={styles.filterSection}>
            <Accordion
              multiple
              collapsible
              openItems={openAccordionItems}
              onToggle={(_, data) => setOpenAccordionItems(data.openItems as string[])}
              className={styles.filterAccordion}
            >
              <AccordionItem value="sort" className={styles.sortSection}>
                <AccordionHeader expandIconPosition="end" className={styles.accordionHeader}>
                  Sort By
                </AccordionHeader>
                <AccordionPanel>
                  <RadioGroup
                    value={tempSortOption}
                    onChange={(_, data) => setTempSortOption(data.value)}
                  >
                    {SORT_BY_OPTIONS.map((option) => (
                      <Radio
                        key={option}
                        value={option}
                        label={option}
                        className={styles.radioOption}
                      />
                    ))}
                  </RadioGroup>
                </AccordionPanel>
              </AccordionItem>

              {SECTIONS.map((section) => (
                <AccordionItem
                  key={section.key}
                  value={section.key}
                  className={`${styles.sortSection} ${styles.mainCategoryItem}`}
                >
                  <AccordionHeader expandIconPosition="end" className={styles.accordionHeader}>
                    {section.title}
                  </AccordionHeader>
                  <AccordionPanel>
                    <FilterSection
                      tags={section.tags}
                      activeTags={activeTags}
                      selected={tempSelectedCheckbox}
                      onToggle={onToggleTag}
                      supportsSubTypes={section.supportsSubTypes}
                    />
                  </AccordionPanel>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </DrawerBody>

        <div className={styles.drawerFooter}>
          <Button appearance="secondary" onClick={handleClear} className={styles.clearButton}>
            Clear {tempFilterCount > 0 && `(${tempFilterCount})`}
          </Button>
          <Button appearance="primary" onClick={handleApply} className={styles.applyButton}>
            Apply
          </Button>
        </div>
      </Drawer>
    </>
  );
}

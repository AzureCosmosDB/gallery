/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { useState, useEffect } from "react";
import { useHistory } from "@docusaurus/router";
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
  Checkbox,
} from "@fluentui/react-components";
import { Dismiss24Regular, Filter24Regular } from "@fluentui/react-icons";
import { Tags, type TagType } from "../../../data/tags";
import { TagList } from "../../../data/users";
import { prepareUserState } from "../../../pages/index";
import styles from "./styles.module.css";

const SORT_BY_OPTIONS = ["Newest", "Recommended"];

interface MobileFilterDrawerProps {
  activeTags: TagType[];
  selectedCheckbox: TagType[];
  setSelectedCheckbox: React.Dispatch<React.SetStateAction<TagType[]>>;
  location: any;
  selectedTags: TagType[];
  setSelectedTags: React.Dispatch<React.SetStateAction<TagType[]>>;
  readSearchTags: (search: string) => TagType[];
  replaceSearchTags: (search: string, newTags: TagType[]) => string;
  sortOption: string;
  setSortOption: (option: string) => void;
  filterCount: number;
}

export default function MobileFilterDrawer({
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
  filterCount,
}: MobileFilterDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempSelectedCheckbox, setTempSelectedCheckbox] =
    useState<TagType[]>(selectedCheckbox);
  const [tempSortOption, setTempSortOption] = useState(sortOption);
  const history = useHistory();

  // Sync temp state when drawer opens
  useEffect(() => {
    if (isOpen) {
      setTempSelectedCheckbox(selectedCheckbox);
      setTempSortOption(sortOption);
    }
  }, [isOpen]);

  const handleApply = () => {
    // Apply the filters
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
    setTempSortOption(SORT_BY_OPTIONS[0]);
  };

  const tempFilterCount = tempSelectedCheckbox.length;

  // Toggle a tag in temp state
  const toggleTempTag = (tag: TagType) => {
    if (tempSelectedCheckbox.includes(tag)) {
      // Deselecting - also remove child tags if this is a parent
      const tagObject = Tags[tag];
      let newTags = tempSelectedCheckbox.filter((t) => t !== tag);

      if (tagObject?.subType && Array.isArray(tagObject.subType)) {
        const subKeys = tagObject.subType.map(
          (s) => s.label.toLowerCase() as TagType
        );
        newTags = newTags.filter((t) => !subKeys.includes(t));
      }

      setTempSelectedCheckbox(newTags);
    } else {
      // Selecting
      setTempSelectedCheckbox([...tempSelectedCheckbox, tag]);
    }
  };

  // Organize tags by type
  const learningPathTags = TagList.filter(
    (tag) => Tags[tag]?.type === "LearningPath"
  );
  const serviceTags = TagList.filter((tag) => Tags[tag]?.type === "Service");
  const contentTypeTags = TagList.filter(
    (tag) => Tags[tag]?.type === "ContentType"
  );
  const resourceTypeTags = TagList.filter(
    (tag) => Tags[tag]?.type === "ResourceType"
  );
  const languageTags = TagList.filter((tag) => Tags[tag]?.type === "Language");

  const [openAccordionItems, setOpenAccordionItems] = useState([
    "1",
    "2",
    "3",
    "4",
    "5",
  ]);

  return (
    <>
      <Button
        appearance="outline"
        icon={<Filter24Regular />}
        className={styles.filterButton}
        onClick={() => setIsOpen(true)}
      >
        Filters
        {filterCount > 0 && (
          <span className={styles.filterBadge}>{filterCount}</span>
        )}
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
          {/* Sort Options */}
          <div className={styles.sortSection}>
            <h3 className={styles.sectionTitle}>Sort By</h3>
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
          </div>

          {/* Divider */}
          <div className={styles.divider}></div>

          {/* Filter Options */}
          <div className={styles.filterSection}>
            <Accordion
              multiple
              collapsible
              openItems={openAccordionItems}
              onToggle={(e, data) =>
                setOpenAccordionItems(data.openItems as string[])
              }
              className={styles.filterAccordion}
            >
              {/* Learning Paths */}
              <AccordionItem value="1" className={styles.sortSection}>
                <AccordionHeader
                  expandIconPosition="end"
                  className={styles.accordionHeader}
                >
                  Learning Paths
                </AccordionHeader>
                <AccordionPanel>
                  {learningPathTags.map((tag) => {
                    const tagObject = Tags[tag];
                    return (
                      <div key={tag} className={styles.checkboxItem}>
                        <Checkbox
                          checked={tempSelectedCheckbox.includes(tag)}
                          onChange={() => toggleTempTag(tag)}
                          label={tagObject.label}
                          disabled={!activeTags.includes(tag)}
                        />
                      </div>
                    );
                  })}
                </AccordionPanel>
              </AccordionItem>

              {/* Services */}
              <AccordionItem value="2" className={styles.sortSection}>
                <AccordionHeader
                  expandIconPosition="end"
                  className={styles.accordionHeader}
                >
                  Services
                </AccordionHeader>
                <AccordionPanel>
                  {serviceTags.map((tag) => {
                    const tagObject = Tags[tag];
                    const hasSubTags =
                      tagObject.subType &&
                      Array.isArray(tagObject.subType) &&
                      tagObject.subType.length > 0;

                    if (hasSubTags) {
                      return (
                        <div key={tag} className={styles.nestedCheckboxGroup}>
                          <div className={styles.checkboxItem}>
                            <Checkbox
                              checked={tempSelectedCheckbox.includes(tag)}
                              onChange={() => toggleTempTag(tag)}
                              label={tagObject.label}
                              disabled={!activeTags.includes(tag)}
                            />
                          </div>
                          {tempSelectedCheckbox.includes(tag) && (
                            <div className={styles.subCheckboxGroup}>
                              {tagObject.subType.map((sub) => {
                                const subTagKey =
                                  sub.label.toLowerCase() as TagType;
                                const subTagObject = Tags[subTagKey];
                                return (
                                  <div
                                    key={subTagKey}
                                    className={styles.checkboxItem}
                                  >
                                    <Checkbox
                                      checked={tempSelectedCheckbox.includes(
                                        subTagKey
                                      )}
                                      onChange={() => toggleTempTag(subTagKey)}
                                      label={subTagObject.label}
                                      disabled={!activeTags.includes(subTagKey)}
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    }

                    return (
                      <div key={tag} className={styles.checkboxItem}>
                        <Checkbox
                          checked={tempSelectedCheckbox.includes(tag)}
                          onChange={() => toggleTempTag(tag)}
                          label={tagObject.label}
                          disabled={!activeTags.includes(tag)}
                        />
                      </div>
                    );
                  })}
                </AccordionPanel>
              </AccordionItem>

              {/* Content Type */}
              <AccordionItem value="3" className={styles.sortSection}>
                <AccordionHeader
                  expandIconPosition="end"
                  className={styles.accordionHeader}
                >
                  Content Type
                </AccordionHeader>
                <AccordionPanel>
                  {contentTypeTags.map((tag) => {
                    const tagObject = Tags[tag];
                    return (
                      <div key={tag} className={styles.checkboxItem}>
                        <Checkbox
                          checked={tempSelectedCheckbox.includes(tag)}
                          onChange={() => toggleTempTag(tag)}
                          label={tagObject.label}
                          disabled={!activeTags.includes(tag)}
                        />
                      </div>
                    );
                  })}
                </AccordionPanel>
              </AccordionItem>

              {/* Resource Type */}
              <AccordionItem value="4" className={styles.sortSection}>
                <AccordionHeader
                  expandIconPosition="end"
                  className={styles.accordionHeader}
                >
                  Resource Type
                </AccordionHeader>
                <AccordionPanel>
                  {resourceTypeTags.map((tag) => {
                    const tagObject = Tags[tag];
                    return (
                      <div key={tag} className={styles.checkboxItem}>
                        <Checkbox
                          checked={tempSelectedCheckbox.includes(tag)}
                          onChange={() => toggleTempTag(tag)}
                          label={tagObject.label}
                          disabled={!activeTags.includes(tag)}
                        />
                      </div>
                    );
                  })}
                </AccordionPanel>
              </AccordionItem>

              {/* Language */}
              <AccordionItem value="5" className={styles.sortSection}>
                <AccordionHeader
                  expandIconPosition="end"
                  className={styles.accordionHeader}
                >
                  Language
                </AccordionHeader>
                <AccordionPanel>
                  {languageTags.map((tag) => {
                    const tagObject = Tags[tag];
                    return (
                      <div key={tag} className={styles.checkboxItem}>
                        <Checkbox
                          checked={tempSelectedCheckbox.includes(tag)}
                          onChange={() => toggleTempTag(tag)}
                          label={tagObject.label}
                          disabled={!activeTags.includes(tag)}
                        />
                      </div>
                    );
                  })}
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          </div>
        </DrawerBody>

        {/* Footer with Clear and Apply buttons */}
        <div className={styles.drawerFooter}>
          <Button
            appearance="secondary"
            onClick={handleClear}
            className={styles.clearButton}
          >
            Clear {tempFilterCount > 0 && `(${tempFilterCount})`}
          </Button>
          <Button
            appearance="primary"
            onClick={handleApply}
            className={styles.applyButton}
          >
            Apply
          </Button>
        </div>
      </Drawer>
    </>
  );
}

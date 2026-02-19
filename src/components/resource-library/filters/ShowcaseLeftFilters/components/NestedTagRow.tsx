import React from "react";
import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
} from "@fluentui/react-components";
import { Tags, type TagType } from "../../../../../data/tags";
import { TagRow } from "./TagRow";
import { LearningPathTagRow } from "./LearningPathTagRow";
import { toTagKey } from "../utils/tagKeys";
import styles from "../styles.module.css";
import type { Location } from "history";

export function NestedTagRow({
  tag,
  openInner,
  setOpenInner,
  activeTags,
  selectedCheckbox,
  setSelectedCheckbox,
  location,
  readSearchTags,
  replaceSearchTags,
  isLearningPath = false,
}: {
  tag: TagType;
  openInner: string[];
  setOpenInner: React.Dispatch<React.SetStateAction<string[]>>;
  activeTags: TagType[];
  selectedCheckbox: TagType[];
  setSelectedCheckbox: React.Dispatch<React.SetStateAction<TagType[]>>;
  location: Location;
  readSearchTags: (search: string) => TagType[];
  replaceSearchTags: (search: string, newTags: TagType[]) => string;
  isLearningPath?: boolean;
}) {
  const tagObject = Tags[tag];
  const id = `showcase_checkbox_id_${tag}`;

  return (
    <Accordion
      multiple
      collapsible
      openItems={openInner}
      onToggle={(e, data) => setOpenInner(data.openItems as string[])}
    >
      <AccordionItem value={`${tag}-subtags`}>
        <AccordionHeader expandIconPosition="end">
          <div className={styles.checkboxListItem}>
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
        </AccordionHeader>
        <AccordionPanel>
          {tagObject.subType!.map((sub, _idx) => {
            const subTagKey = toTagKey(sub.label);
            const uniqueKey = `${tag}-${subTagKey}`;
            const uniqueId = `showcase_checkbox_id_${tag}_${subTagKey}`;
            return (
              <div key={uniqueKey} className={styles.subCheckboxListItem}>
                {isLearningPath ? (
                  <LearningPathTagRow
                    id={uniqueId}
                    tag={subTagKey}
                    label={sub.label}
                    activeTags={activeTags}
                    selectedCheckbox={selectedCheckbox}
                    setSelectedCheckbox={setSelectedCheckbox}
                    location={location}
                    readSearchTags={readSearchTags}
                    replaceSearchTags={replaceSearchTags}
                  />
                ) : (
                  <TagRow
                    id={uniqueId}
                    tag={subTagKey}
                    label={sub.label}
                    activeTags={activeTags}
                    selectedCheckbox={selectedCheckbox}
                    setSelectedCheckbox={setSelectedCheckbox}
                    location={location}
                    readSearchTags={readSearchTags}
                    replaceSearchTags={replaceSearchTags}
                    parentTag={tag}
                  />
                )}
              </div>
            );
          })}
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
}

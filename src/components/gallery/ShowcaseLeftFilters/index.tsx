/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React from "react";
import ShowcaseTagSelect from "../ShowcaseTagSelect";
import useBaseUrl from "@docusaurus/useBaseUrl";
import { useHistory } from "@docusaurus/router";
import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  AccordionToggleEventHandler,
} from "@fluentui/react-components";
import { Tags, type TagType } from "../../../data/tags";
import { TagList } from "../../../data/users";
import { prepareUserState } from "../../../pages/index";
import {
  getSubTagKey,
  isContextualSubTag,
} from "../../../utils/filterTagUtils";
import styles from "./styles.module.css";
import CustomCheckbox from "../CustomCheckbox";
function LearningPathTagSelect({
  label,
  tag,
  id,
  activeTags,
  selectedCheckbox,
  setSelectedCheckbox,
  location,
  readSearchTags,
  replaceSearchTags,
}: {
  label: string;
  tag: TagType;
  id: string;
  activeTags: TagType[];
  selectedCheckbox: TagType[];
  setSelectedCheckbox: React.Dispatch<React.SetStateAction<TagType[]>>;
  location;
  readSearchTags: (search: string) => TagType[];
  replaceSearchTags: (search: string, newTags: TagType[]) => string;
}) {
  const history = useHistory();

  // Learning path tags that should be mutually exclusive
  const learningPathTags = [
    "developing-core-applications",
    "building-genai-apps",
    "building-ai-agents",
  ];

  const toggleTag = () => {
    // Check if the tag is currently selected
    const isCurrentlySelected = selectedCheckbox.includes(tag);

    if (isCurrentlySelected) {
      // If currently selected, remove it (uncheck) - only remove this learning path tag
      const tags = readSearchTags(location.search);
      const newTags = tags.filter((t) => t !== tag);
      const newSearch = replaceSearchTags(location.search, newTags);
      history.replace({
        ...location,
        search: newSearch,
      });
    } else {
      // Define compatible resource types for each learning path
      const learningPathCompatibility = {
        "building-genai-apps": [
          "documentation",
          "tutorial",
          "concepts",
          "how-to",
          "video",
          "workshop",
          "training",
        ],
        "developing-core-applications": [
          "documentation",
          "tutorial",
          "concepts",
          "how-to",
          "video",
          "blog",
          "workshop",
          "training",
        ],
        "building-ai-agents": [
          "documentation",
          "tutorial",
          "concepts",
          "how-to",
          "video",
          "workshop",
          "training",
        ],
      };

      const compatibleTypes = learningPathCompatibility[tag] || [];

      // If not selected, clear other learning path tags AND incompatible resource types
      const tags = readSearchTags(location.search);

      // Remove all other learning path tags and incompatible resource type tags
      const newTags = tags.filter((t) => {
        // Keep if not a learning path tag (except the one we're adding)
        if (!learningPathTags.includes(t as any)) {
          // For non-learning-path tags, check if it's a resource type
          const tagObject = Tags[t];
          if (tagObject && tagObject.type === "ResourceType") {
            // Keep only compatible resource types
            return compatibleTypes.includes(t);
          }
          // Keep all non-resource-type tags (Language, ContentType, etc.)
          return true;
        }
        return false;
      });

      // Add the selected learning path tag
      newTags.push(tag);
      const newSearch = replaceSearchTags(location.search, newTags);
      history.replace({
        ...location,
        search: newSearch,
      });

      // Switch to list view for learning paths without scrolling the page
      requestAnimationFrame(() => {
        window.dispatchEvent(new Event("switchToListView"));
      });
    }
  };

  const toggleCheck = (tag: TagType) => {
    if (selectedCheckbox.includes(tag)) {
      setSelectedCheckbox(selectedCheckbox.filter((item) => item !== tag));
    } else {
      setSelectedCheckbox([...selectedCheckbox, tag]);
    }
  };

  // Adobe Analytics
  const checkbox = id.replace("showcase_checkbox_id_", "");
  const contentForAdobeAnalytics = `{\"id\":\"${checkbox}\",\"cN\":\"Tags\"}`;

  // Check if this learning path tag should be disabled
  // It should be disabled if another learning path tag is selected and this one isn't
  const otherLearningPathSelected = learningPathTags.some(
    (lpTag) => lpTag !== tag && selectedCheckbox.includes(lpTag as TagType),
  );
  const isDisabled = !activeTags?.includes(tag) || otherLearningPathSelected;

  return (
    <CustomCheckbox
      id={id}
      data-m={contentForAdobeAnalytics}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          toggleTag();
          toggleCheck(tag);
        }
      }}
      onChange={() => {
        toggleTag();
        toggleCheck(tag);
      }}
      checked={selectedCheckbox.includes(tag)}
      label={label}
      disabled={isDisabled}
    />
  );
}

function ShowcaseFilterViewAll({
  tags,
  number,
  activeTags,
  selectedCheckbox,
  setSelectedCheckbox,
  location,
  readSearchTags,
  replaceSearchTags,
  isLearningPath = false,
}) {
  const [openInner, setOpenInner] = React.useState<string[]>([]);

  return (
    <>
      {tags.map((tag) => {
        const tagObject = Tags[tag];
        const key = `showcase_checkbox_key_${tag}`;
        const id = `showcase_checkbox_id_${tag}`;
        if (Array.isArray(tagObject.subType) && tagObject.subType.length > 0) {
          // Tag has subTags: render as Accordion with tag checkbox as header
          return (
            <Accordion
              key={key}
              multiple
              collapsible
              openItems={openInner}
              onToggle={(e, data) => setOpenInner(data.openItems as string[])}
            >
              <AccordionItem value={`${tag}-subtags`}>
                <AccordionHeader expandIconPosition="end">
                  <div className={styles.checkboxListItem}>
                    {isLearningPath ? (
                      <LearningPathTagSelect
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
                      <ShowcaseTagSelect
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
                  {tagObject.subType.map((sub, idx) => {
                    const subTagKey = getSubTagKey(tag, sub.label);
                    const subTagObject = Tags[subTagKey];
                    // Create unique key combining parent and child to prevent React confusion
                    const uniqueKey = `${tag}-${subTagKey}`;
                    const uniqueId = `showcase_checkbox_id_${tag}_${subTagKey}`;
                    return (
                      <div
                        key={uniqueKey}
                        className={styles.subCheckboxListItem}
                      >
                        {isLearningPath ? (
                          <LearningPathTagSelect
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
                          <ShowcaseTagSelect
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
        } else {
          // Tag has no subTags: render as normal checkbox
          return (
            <div key={key} className={styles.checkboxListItem}>
              {isLearningPath ? (
                <LearningPathTagSelect
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
                <ShowcaseTagSelect
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
        }
      })}
    </>
  );
}

export default function ShowcaseLeftFilters({
  activeTags,
  selectedCheckbox,
  setSelectedCheckbox,
  location,
  selectedTags,
  setSelectedTags,
  readSearchTags,
  replaceSearchTags,
}: {
  activeTags: TagType[];
  selectedCheckbox: TagType[];
  setSelectedCheckbox: React.Dispatch<React.SetStateAction<TagType[]>>;
  location;
  selectedTags: TagType[];
  setSelectedTags: React.Dispatch<React.SetStateAction<TagType[]>>;
  readSearchTags: (search: string) => TagType[];
  replaceSearchTags: (search: string, newTags: TagType[]) => string;
}) {
  const languageTag = TagList.filter((tag) => {
    const tagObject = Tags[tag];
    return tagObject.type === "Language";
  });
  const resourceTypeTag = TagList.filter((tag) => {
    const tagObject = Tags[tag];
    // Exclude standalone documentation sub-types (concepts, how-to, tutorial) since they appear under Documentation parent
    return (
      tagObject.type === "ResourceType" &&
      !["concepts", "how-to", "tutorial"].includes(tag)
    );
  });
  const contentTypeTag = TagList.filter((tag) => {
    const tagObject = Tags[tag];
    return tagObject.type === "ContentType" && !isContextualSubTag(tag);
  });
  const serviceTag = TagList.filter((tag) => {
    const tagObject = Tags[tag];
    return tagObject.type === "Service";
  });
  const learningPathTag = TagList.filter((tag) => {
    const tagObject = Tags[tag];
    return tagObject.type === "LearningPath";
  });

  const [openItems, setOpenItems] = React.useState(["1", "2", "3", "4", "5"]);

  const handleToggle: AccordionToggleEventHandler<string> = (event, data) => {
    setOpenItems(data.openItems);
  };

  return (
    <Accordion
      openItems={openItems}
      onToggle={handleToggle}
      multiple
      collapsible
    >
      <AccordionItem value="1" className={styles.mainCategoryItem}>
        <AccordionHeader
          expandIconPosition="end"
          className={styles.tagCatalogBackground}
        >
          <div
            className={styles.tagCatalog}
            data-m='{\"id\":\"Learning Paths\",\"cN\":\"Tags Category\"}'
          >
            Learning Pathways
          </div>
        </AccordionHeader>
        <AccordionPanel>
          <ShowcaseFilterViewAll
            tags={learningPathTag}
            number={"1"}
            activeTags={activeTags}
            selectedCheckbox={selectedCheckbox}
            setSelectedCheckbox={setSelectedCheckbox}
            location={location}
            readSearchTags={readSearchTags}
            replaceSearchTags={replaceSearchTags}
            isLearningPath={true}
          />
        </AccordionPanel>
      </AccordionItem>
      <AccordionItem value="2" className={styles.mainCategoryItem}>
        <AccordionHeader
          expandIconPosition="end"
          className={styles.tagCatalogBackground}
        >
          <div
            className={styles.tagCatalog}
            data-m='{\"id\":\"Service\",\"cN\":\"Tags Category\"}'
          >
            Products
          </div>
        </AccordionHeader>
        <AccordionPanel>
          <ShowcaseFilterViewAll
            tags={serviceTag}
            number={"2"}
            activeTags={activeTags}
            selectedCheckbox={selectedCheckbox}
            setSelectedCheckbox={setSelectedCheckbox}
            location={location}
            readSearchTags={readSearchTags}
            replaceSearchTags={replaceSearchTags}
          />
        </AccordionPanel>
      </AccordionItem>
      <AccordionItem value="3" className={styles.mainCategoryItem}>
        <AccordionHeader
          expandIconPosition="end"
          className={styles.tagCatalogBackground}
        >
          <div
            className={styles.tagCatalog}
            data-m='{\"id\":\"ResourceType\",\"cN\":\"Tags Category\"}'
          >
            Resource Type
          </div>
        </AccordionHeader>
        <AccordionPanel>
          <ShowcaseFilterViewAll
            tags={resourceTypeTag}
            number={"3"}
            activeTags={activeTags}
            selectedCheckbox={selectedCheckbox}
            setSelectedCheckbox={setSelectedCheckbox}
            location={location}
            readSearchTags={readSearchTags}
            replaceSearchTags={replaceSearchTags}
          />
        </AccordionPanel>
      </AccordionItem>
      <AccordionItem value="4" className={styles.mainCategoryItem}>
        <AccordionHeader
          expandIconPosition="end"
          className={styles.tagCatalogBackground}
        >
          <div
            className={styles.tagCatalog}
            data-m='{\"id\":\"ContentType\",\"cN\":\"Tags Category\"}'
          >
            Category
          </div>
        </AccordionHeader>
        <AccordionPanel>
          <ShowcaseFilterViewAll
            tags={contentTypeTag}
            number={"4"}
            activeTags={activeTags}
            selectedCheckbox={selectedCheckbox}
            setSelectedCheckbox={setSelectedCheckbox}
            location={location}
            readSearchTags={readSearchTags}
            replaceSearchTags={replaceSearchTags}
          />
        </AccordionPanel>
      </AccordionItem>
      <AccordionItem value="5" className={styles.mainCategoryItem}>
        <AccordionHeader expandIconPosition="end">
          <div
            className={styles.tagCatalog}
            data-m='{\"id\":\"Language\",\"cN\":\"Tags Category\"}'
          >
            Language
          </div>
        </AccordionHeader>
        <AccordionPanel>
          <ShowcaseFilterViewAll
            tags={languageTag}
            number={"5"}
            activeTags={activeTags}
            selectedCheckbox={selectedCheckbox}
            setSelectedCheckbox={setSelectedCheckbox}
            location={location}
            readSearchTags={readSearchTags}
            replaceSearchTags={replaceSearchTags}
          />
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
}

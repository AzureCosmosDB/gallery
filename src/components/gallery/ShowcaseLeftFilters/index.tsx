/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React from "react";
import ShowcaseTagSelect from "../ShowcaseTagSelect";
import useBaseUrl from "@docusaurus/useBaseUrl";
import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  AccordionToggleEventHandler,
  Title3,
} from "@fluentui/react-components";
import { Tags, type TagType, openai, meta, microsoft, mistralai } from "../../../data/tags";
import { TagList } from "../../../data/users";
import styles from "./styles.module.css";
import { useColorMode } from "@docusaurus/theme-common";
import { useHistory } from "@docusaurus/router";
import { prepareUserState } from "@site/src/pages/index";

function ShowcaseFilterViewAll({
  tags,
  number,
  activeTags,
  selectedCheckbox,
  setSelectedCheckbox,
  location,
  readSearchTags,
  replaceSearchTags,
}: {
  tags: TagType[];
  number: string;
  activeTags: TagType[];
  selectedCheckbox: TagType[];
  setSelectedCheckbox: React.Dispatch<React.SetStateAction<TagType[]>>;
  location;
  readSearchTags: (search: string) => TagType[];
  replaceSearchTags: (search: string, newTags: TagType[]) => string;
}) {
  const [openItems, setOpenItems] = React.useState(["0"]);
  const handleToggle: AccordionToggleEventHandler<string> = (event, data) => {
    setOpenItems(data.openItems);
  };
  const chevronDownSmall = <img src={useBaseUrl("/img/smallChevron.svg")} />;
  const chevronUpSmall =
    <img
      style={{ transform: "rotate(180deg)" }
      }
      src={useBaseUrl("/img/smallChevron.svg")}
    />;
  let value = number + "2";
  return (
    <>
      {tags.slice(0, 6).map((tag, index) => {
        const tagObject = Tags[tag];
        const key = `showcase_checkbox_key_${tag}`;
        const id = `showcase_checkbox_id_${tag}`;

        return index == tags.length - 1 ? (
          <div
            key={key}
            className={styles.checkboxListItem}
            style={{ marginBottom: "7px" }}
          >
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
          </div>
        ) : (
          <div key={key} className={styles.checkboxListItem}>
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
          </div>
        );
      })}
      {tags.length > 5 ? (
        <Accordion
          openItems={openItems}
          onToggle={handleToggle}
          multiple
          collapsible
        >
          <AccordionItem value={value} style={{ padding: "0px" }}>
            <AccordionPanel style={{ margin: "0px" }}>
              {tags.slice(6, tags.length).map((tag) => {
                const tagObject = Tags[tag];
                const id = `showcase_checkbox_id_${tag}`;
                const key = `showcase_checkbox_key_${tag}`;

                return (
                  <div key={key} className={styles.checkboxListItem}>
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
                  </div>
                );
              })}
            </AccordionPanel>
            <AccordionHeader
              inline={true}
              expandIconPosition="end"
              expandIcon={
                openItems.includes(value) ? chevronUpSmall : chevronDownSmall
              }
            >
              <div
                style={{
                  fontSize: "12px",
                }}
                className={styles.color}
              >
                View All
              </div>
            </AccordionHeader>
          </AccordionItem>
        </Accordion>
      ) : null}
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
  const sortTagList = TagList.sort();
  const languageTag = sortTagList.filter((tag) => {
    const tagObject = Tags[tag];
    return tagObject.type === "Language";
  });
  const modelOpenAITag = sortTagList.filter((tag) => {
    const tagObject = Tags[tag];
    return tagObject.type === "Model" && tagObject.subType === openai;
  });
  const modelMetaTag = sortTagList.filter((tag) => {
    const tagObject = Tags[tag];
    return tagObject.type === "Model" && tagObject.subType === meta;
  });
  const modelMicrosoftTag = sortTagList.filter((tag) => {
    const tagObject = Tags[tag];
    return tagObject.type === "Model" && tagObject.subType === microsoft;
  });
  const modelMistralAITag = sortTagList.filter((tag) => {
    const tagObject = Tags[tag];
    return tagObject.type === "Model" && tagObject.subType === mistralai;
  });
  
  const intelligentSolutionTag = sortTagList.filter((tag) => {
    const tagObject = Tags[tag];
    return tagObject.type === "Intelligent Solution";
  });
  const resourceTypeTag = sortTagList.filter((tag) => {
    const tagObject = Tags[tag];
    return tagObject.type === "ResourceType";
  });
  const [openItems, setOpenItems] = React.useState([
    "1",
    "2",
    "3",
    "4"
  ]);
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
      <div className={styles.filterBy}>
        <Title3>Filter by</Title3>
      </div>
      <AccordionItem value="1">
        <AccordionHeader expandIconPosition="end" className={styles.tagCatalogBackground}>
          <div className={styles.tagCatalog} data-m='{\"id\":\"ResourceType\",\"cN\":\"Tags Category\"}'>Resource Type</div>
        </AccordionHeader>
        <AccordionPanel>
          <ShowcaseFilterViewAll
            tags={resourceTypeTag}
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
      <AccordionItem value="2">
        <AccordionHeader expandIconPosition="end">
          <div className={styles.tagCatalog} data-m='{\"id\":\"Language\",\"cN\":\"Tags Category\"}'>Language</div>
        </AccordionHeader>
        <AccordionPanel>
          <ShowcaseFilterViewAll
            tags={languageTag}
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
      <AccordionItem value="3">
        <AccordionHeader expandIconPosition="end" className={styles.tagCatalogBackground}>
          <div className={styles.tagCatalog} data-m='{\"id\":\"Model\",\"cN\":\"Tags Category\"}'>Model</div>
        </AccordionHeader>
        <AccordionPanel>
          <div className={styles.tagSubCatalog} data-m='{\"id\":\"OpenAI\",\"cN\":\"Tags Sub Category\"}'>OpenAI</div>
          <ShowcaseFilterViewAll
            tags={modelOpenAITag}
            number={"21"}
            activeTags={activeTags}
            selectedCheckbox={selectedCheckbox}
            setSelectedCheckbox={setSelectedCheckbox}
            location={location}
            readSearchTags={readSearchTags}
            replaceSearchTags={replaceSearchTags}
          />
        </AccordionPanel>
        <AccordionPanel>
          <div className={styles.tagSubCatalog} data-m='{\"id\":\"Meta\",\"cN\":\"Tags Sub Category\"}'>Meta</div>
          <ShowcaseFilterViewAll
            tags={modelMetaTag}
            number={"22"}
            activeTags={activeTags}
            selectedCheckbox={selectedCheckbox}
            setSelectedCheckbox={setSelectedCheckbox}
            location={location}
            readSearchTags={readSearchTags}
            replaceSearchTags={replaceSearchTags}
          />
        </AccordionPanel>
        <AccordionPanel>
          <div className={styles.tagSubCatalog} data-m='{\"id\":\"Microsoft\",\"cN\":\"Tags Sub Category\"}'>Microsoft</div>
          <ShowcaseFilterViewAll
            tags={modelMicrosoftTag}
            number={"23"}
            activeTags={activeTags}
            selectedCheckbox={selectedCheckbox}
            setSelectedCheckbox={setSelectedCheckbox}
            location={location}
            readSearchTags={readSearchTags}
            replaceSearchTags={replaceSearchTags}
          />
        </AccordionPanel>
        <AccordionPanel>
          <div className={styles.tagSubCatalog} data-m='{\"id\":\"MistralAI\",\"cN\":\"Tags Sub Category\"}'>Mistral AI</div>
          <ShowcaseFilterViewAll
            tags={modelMistralAITag}
            number={"24"}
            activeTags={activeTags}
            selectedCheckbox={selectedCheckbox}
            setSelectedCheckbox={setSelectedCheckbox}
            location={location}
            readSearchTags={readSearchTags}
            replaceSearchTags={replaceSearchTags}
          />
        </AccordionPanel>
      </AccordionItem>
      <AccordionItem value="4">
        <AccordionHeader expandIconPosition="end" className={styles.tagCatalogBackground}>
          <div className={styles.tagCatalog} data-m='{\"id\":\"Intelligent Solution\",\"cN\":\"Tags Category\"}'>Intelligent Solution</div>
        </AccordionHeader>
        <AccordionPanel>
          <ShowcaseFilterViewAll
            tags={intelligentSolutionTag}
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
     
    </Accordion>
  );
}

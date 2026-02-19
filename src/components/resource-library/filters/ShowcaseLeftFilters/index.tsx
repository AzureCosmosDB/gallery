/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { useState } from 'react';
import { useLocation } from '@docusaurus/router';
import { Accordion, AccordionToggleEventHandler } from '@fluentui/react-components';
import type { TagType } from '../../../../data/tags';
import { useTagGroups } from './hooks/useTagGroups';
import { TagGroupAccordion } from './components/TagGroupAccordion';

interface ShowcaseLeftFiltersProps {
  activeTags: TagType[];
  selectedCheckbox: TagType[];
  setSelectedCheckbox: React.Dispatch<React.SetStateAction<TagType[]>>;
  selectedTags: TagType[];
  setSelectedTags: React.Dispatch<React.SetStateAction<TagType[]>>;
  readSearchTags: (search: string) => TagType[];
  replaceSearchTags: (search: string, newTags: TagType[]) => string;
}

export default function ShowcaseLeftFilters({
  activeTags,
  selectedCheckbox,
  setSelectedCheckbox,
  selectedTags,
  setSelectedTags,
  readSearchTags,
  replaceSearchTags,
}: ShowcaseLeftFiltersProps) {
  const location = useLocation();
  const tagGroups = useTagGroups();

  const [openItems, setOpenItems] = useState(['1', '2', '3', '4', '5']);

  const handleToggle: AccordionToggleEventHandler<string> = (event, data) => {
    setOpenItems(data.openItems);
  };

  const tagGroupConfigs = [
    {
      value: '1',
      title: 'Learning Pathways',
      categoryId: 'Learning Paths',
      tags: tagGroups.learningPath,
      isLearningPath: true,
    },
    {
      value: '2',
      title: 'Products',
      categoryId: 'Service',
      tags: tagGroups.service,
      isLearningPath: false,
    },
    {
      value: '3',
      title: 'Resource Type',
      categoryId: 'ResourceType',
      tags: tagGroups.resourceType,
      isLearningPath: false,
    },
    {
      value: '4',
      title: 'Category',
      categoryId: 'ContentType',
      tags: tagGroups.contentType,
      isLearningPath: false,
    },
    {
      value: '5',
      title: 'Language',
      categoryId: 'Language',
      tags: tagGroups.language,
      isLearningPath: false,
    },
  ];

  return (
    <Accordion openItems={openItems} onToggle={handleToggle} multiple collapsible>
      {tagGroupConfigs.map((config) => (
        <TagGroupAccordion
          key={config.value}
          value={config.value}
          title={config.title}
          categoryId={config.categoryId}
          tags={config.tags}
          activeTags={activeTags}
          selectedCheckbox={selectedCheckbox}
          setSelectedCheckbox={setSelectedCheckbox}
          location={location}
          readSearchTags={readSearchTags}
          replaceSearchTags={replaceSearchTags}
          isLearningPath={config.isLearningPath}
        />
      ))}
    </Accordion>
  );
}

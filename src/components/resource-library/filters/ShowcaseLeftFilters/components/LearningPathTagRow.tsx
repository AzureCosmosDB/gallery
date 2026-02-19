import React from 'react';
import { useHistory } from '@docusaurus/router';
import type { TagType } from '../../../../../data/tags';
import type { Location } from '@docusaurus/router';
import CustomCheckbox from '../../../shared/CustomCheckbox';
import { prepareUserState } from '../../../../home/HomePage';
import {
  isAnyOtherLearningPathSelected,
  applyLearningPathSelection,
  removeLearningPathTag,
} from '../utils/learningPathRules';
import { adobeTagCheckboxData } from '../utils/analytics';

function scrollToResourceLibrary() {
  requestAnimationFrame(() => {
    const el = document.getElementById('resource-library');
    if (el) {
      const navbar = document.querySelector('.navbar');
      const navbarHeight = navbar ? (navbar as HTMLElement).offsetHeight : 80;
      const elementPosition = el.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - navbarHeight - 20;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
      // Dispatch custom event to switch to list view for learning paths
      window.dispatchEvent(new Event('switchToListView'));
    }
  });
}

export function LearningPathTagRow({
  id,
  tag,
  label,
  activeTags,
  selectedCheckbox,
  setSelectedCheckbox,
  location,
  readSearchTags,
  replaceSearchTags,
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
}) {
  const history = useHistory();

  const toggleTag = () => {
    const isCurrentlySelected = selectedCheckbox.includes(tag);

    if (isCurrentlySelected) {
      // If currently selected, remove it (uncheck) - only remove this learning path tag
      const tags = readSearchTags(location.search);
      const newTags = removeLearningPathTag(tags, tag);
      const newSearch = replaceSearchTags(location.search, newTags);
      history.replace({
        ...location,
        search: newSearch,
        state: prepareUserState(),
      });
    } else {
      // If not selected, apply learning path selection rules
      const tags = readSearchTags(location.search);
      const newTags = applyLearningPathSelection({
        currentTags: tags,
        selectedLearningPath: tag,
      });

      const newSearch = replaceSearchTags(location.search, newTags);
      history.replace({
        ...location,
        search: newSearch,
        state: prepareUserState(),
      });

      // Scroll to resource library and switch to list view only when checking
      scrollToResourceLibrary();
    }
  };

  const toggleCheck = (tag: TagType) => {
    if (selectedCheckbox.includes(tag)) {
      setSelectedCheckbox(selectedCheckbox.filter((item) => item !== tag));
    } else {
      setSelectedCheckbox([...selectedCheckbox, tag]);
    }
  };

  // Check if this learning path tag should be disabled
  const otherLearningPathSelected = isAnyOtherLearningPathSelected(selectedCheckbox, tag);
  const isDisabled = !activeTags?.includes(tag) || otherLearningPathSelected;

  return (
    <CustomCheckbox
      id={id}
      data-m={adobeTagCheckboxData(id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
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

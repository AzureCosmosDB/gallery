import { Tags, type TagType } from '../../../../../data/tags';

export const LEARNING_PATH_TAGS: TagType[] = [
  'developing-core-applications',
  'building-genai-apps',
  'building-ai-agents',
];

const COMPATIBILITY: Record<TagType, TagType[]> = {
  'building-genai-apps': [
    'documentation',
    'tutorial',
    'concepts',
    'how-to',
    'video',
    'workshop',
    'training',
    'samples',
  ],
  'developing-core-applications': [
    'documentation',
    'tutorial',
    'concepts',
    'how-to',
    'video',
    'blog',
    'workshop',
    'training',
    'samples',
  ],
  'building-ai-agents': [
    'documentation',
    'tutorial',
    'concepts',
    'how-to',
    'video',
    'workshop',
    'training',
    'samples',
  ],
};

export function isAnyOtherLearningPathSelected(selected: TagType[], current: TagType) {
  return LEARNING_PATH_TAGS.some((t) => t !== current && selected.includes(t));
}

export function applyLearningPathSelection({
  currentTags,
  selectedLearningPath,
}: {
  currentTags: TagType[];
  selectedLearningPath: TagType;
}): TagType[] {
  const compatibleTypes = COMPATIBILITY[selectedLearningPath] ?? [];

  // remove all learning paths + remove incompatible resource types
  const cleaned = currentTags.filter((t) => {
    if (LEARNING_PATH_TAGS.includes(t)) return false;

    const tagObject = Tags[t];
    if (tagObject?.type === 'ResourceType') {
      return compatibleTypes.includes(t);
    }
    return true;
  });

  return [...cleaned, selectedLearningPath];
}

export function removeLearningPathTag(currentTags: TagType[], tag: TagType) {
  return currentTags.filter((t) => t !== tag);
}

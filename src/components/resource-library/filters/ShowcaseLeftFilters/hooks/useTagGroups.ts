import { useMemo } from 'react';
import { Tags, type TagType } from '../../../../../data/tags';
import { TagList } from '../../../../../data/users';

const RESOURCE_TYPE_EXCLUDE: TagType[] = ['concepts', 'how-to', 'tutorial'] as TagType[];

export function useTagGroups() {
  return useMemo(() => {
    const byType = (type: string) => TagList.filter((t) => Tags[t]?.type === type);

    return {
      learningPath: byType('LearningPath'),
      service: byType('Service'),
      resourceType: byType('ResourceType').filter((t) => !RESOURCE_TYPE_EXCLUDE.includes(t)),
      contentType: byType('ContentType'),
      language: byType('Language'),
    };
  }, []);
}

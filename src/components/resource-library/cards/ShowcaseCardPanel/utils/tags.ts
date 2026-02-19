import { Tags, type Tag } from '../../../../../data/tags';
import { TagList } from '../../../../../data/users';
import { sortBy } from '../../../../../utils/jsUtils';

export function getSortedTagObjects(tags: string[]) {
  const objs = tags.filter((t) => t !== 'featured').map((tag) => ({ tag, ...Tags[tag] }));

  return sortBy(objs, (t) => TagList.indexOf(t.tag));
}

export function groupTagsByType(sorted: Array<{ type: string } & Tag>) {
  return {
    models: sorted.filter((t: Tag) => t.type === 'Model'),
    vectorDb: sorted.filter((t: Tag) => t.type === 'VectorDatabase'),
    azure: sorted.filter((t: Tag) => t.type === 'Azure'),
  };
}

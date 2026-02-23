import { useMemo } from "react";
import { getSortedTagObjects, groupTagsByType } from "../utils/tags";

export function useTagSections(userTags: string[]) {
  return useMemo(() => {
    const sorted = getSortedTagObjects(userTags);
    const grouped = groupTagsByType(sorted);

    return [
      { title: "Models", tags: grouped.models },
      { title: "Vector Database", tags: grouped.vectorDb },
      { title: "Products", tags: grouped.azure },
    ];
  }, [userTags]);
}

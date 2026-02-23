import { TAG_MAPPING } from "./constants";
import { getNavbarHeight } from "./utils";

// Apply tag filter by updating history and scrolling to resource library
export function applyTagFilter(
  history: unknown,
  location: unknown,
  tagFilter: string | string[]
): void {
  const params = new URLSearchParams();
  if (Array.isArray(tagFilter)) {
    params.set("tags", tagFilter.join(","));
  } else {
    params.set("tags", tagFilter);
  }

  const loc = location as { pathname?: string };
  const h = history as { replace?: (arg: { pathname?: string; search?: string }) => void };
  h.replace?.({
    pathname: loc.pathname,
    search: `?${params.toString()}`,
  });

  requestAnimationFrame(() => {
    const el = document.getElementById("resource-library");
    if (el) {
      const elementPosition = el.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - getNavbarHeight();
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  });
}

export function getTagForHash(hash: string): string | string[] | undefined {
  return TAG_MAPPING[hash];
}

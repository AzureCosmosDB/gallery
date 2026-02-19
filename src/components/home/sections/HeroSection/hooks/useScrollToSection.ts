import { getNavbarHeight, scrollToElementId } from "../utils/dom";

export function useScrollToSection() {
  return (sectionId: string) => {
    requestAnimationFrame(() => {
      const offset = getNavbarHeight(".navbar", 80);
      scrollToElementId(sectionId, offset);
    });
  };
}

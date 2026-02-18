import { useLocation, useHistory } from '@docusaurus/router';
import { setQueryParam, joinComma } from '../utils/url';
import { useScrollToSection } from './useScrollToSection';

const TAGS_KEY = 'tags';

export function useResourceLibraryNavigation(resourceSectionId: string) {
  const location = useLocation();
  const history = useHistory();
  const scrollToSection = useScrollToSection();

  const navigateToResourceLibrary = (tags: string[] = []) => {
    const nextSearch = setQueryParam(
      location.search,
      TAGS_KEY,
      tags.length ? joinComma(tags) : null
    );

    // Avoid unnecessary history updates
    if (nextSearch !== location.search) {
      history.replace({
        pathname: location.pathname,
        search: nextSearch,
      });
    }

    scrollToSection(resourceSectionId);
  };

  return { navigateToResourceLibrary };
}

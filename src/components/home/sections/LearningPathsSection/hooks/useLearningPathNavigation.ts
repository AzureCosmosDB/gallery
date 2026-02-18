import { useHistory, useLocation } from '@docusaurus/router';
import { scrollToIdWithNavbarOffset } from '../utils/scroll';
import { setSingleParam } from '../utils/url';
import { RESOURCE_LIBRARY_SECTION_ID, SWITCH_TO_LIST_VIEW_EVENT } from '../constants';

export function useLearningPathNavigation() {
  const history = useHistory();
  const location = useLocation();

  const goToResourceLibraryWithTag = (tag: string) => {
    const nextSearch = setSingleParam(location.search, 'tags', tag);

    history.replace({
      pathname: location.pathname,
      search: nextSearch,
    });

    requestAnimationFrame(() => {
      scrollToIdWithNavbarOffset(RESOURCE_LIBRARY_SECTION_ID);
      window.dispatchEvent(new Event(SWITCH_TO_LIST_VIEW_EVENT));
    });
  };

  const scrollToResourceLibrary = () => {
    requestAnimationFrame(() => {
      scrollToIdWithNavbarOffset(RESOURCE_LIBRARY_SECTION_ID);
      window.dispatchEvent(new Event(SWITCH_TO_LIST_VIEW_EVENT));
    });
  };

  return { goToResourceLibraryWithTag, scrollToResourceLibrary };
}

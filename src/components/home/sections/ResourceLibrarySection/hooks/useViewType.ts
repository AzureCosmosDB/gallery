import { ViewType } from '../../../../resource-library/filters/ViewToggle';
import { useEffect, useState } from 'react';

export function useViewType(initialView: ViewType = 'grid') {
  const [viewType, setViewType] = useState<ViewType>(initialView);

  useEffect(() => {
    const handler = () => setViewType('list');
    window.addEventListener('switchToListView', handler);
    return () => window.removeEventListener('switchToListView', handler);
  }, []);

  return [viewType, setViewType] as const;
}

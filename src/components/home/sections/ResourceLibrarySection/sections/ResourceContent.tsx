import React from 'react';
import { Spinner } from '@fluentui/react-components';
import ShowcaseCards from '../../../../gallery/ShowcaseCards';
import ShowcaseList from '../../../../gallery/ShowcaseList';
import type { User } from '../../../data/tags';
import type { ViewType } from '../../../../gallery/ViewToggle';

type Props = {
  loading: boolean;
  viewType: ViewType;
  cards: User[];
};

export function ResourceContent({ loading, viewType, cards }: Props) {
  if (loading) return <Spinner labelPosition="below" label="Loading..." />;

  return viewType === 'grid' ? (
    <ShowcaseCards filteredUsers={cards} coverPage={false} />
  ) : (
    <ShowcaseList filteredUsers={cards} />
  );
}

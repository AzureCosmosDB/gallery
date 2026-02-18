/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { useState, useEffect, useMemo } from 'react';
import ShowcaseEmptyResult from './ShowcaseEmptyResult';
import { type User } from '../../data/tags';
import styles from '../home/styles.module.css';
import ShowcaseCard from './ShowcaseCard';
import Pagination from '../Pagination';
import { useLocation } from '@docusaurus/router';

const LEARNING_PATH_TAGS = [
  'developing-core-applications',
  'building-genai-apps',
  'building-ai-agents',
];

export default function ShowcaseCards({
  filteredUsers,
  coverPage,
  noGrid = false,
  forceShowTileNumber = false,
}: {
  filteredUsers: User[];
  coverPage: boolean;
  noGrid?: boolean;
  forceShowTileNumber?: boolean;
}) {
  const len = filteredUsers ? filteredUsers.length : 0;
  const CARDS_PER_PAGE = 6;
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(len / CARDS_PER_PAGE);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const currentTags = searchParams.getAll('tags');
  const isLearningPathFiltered =
    !coverPage && currentTags.some((tag) => LEARNING_PATH_TAGS.includes(tag));
  const orderedUsers = useMemo(() => {
    if (!isLearningPathFiltered) {
      return filteredUsers;
    }
    return [...filteredUsers].sort((a, b) => {
      const tileA = a.tileNumber ?? Number.MAX_SAFE_INTEGER;
      const tileB = b.tileNumber ?? Number.MAX_SAFE_INTEGER;
      if (tileA === tileB) {
        return (a.order || 0) - (b.order || 0);
      }
      return tileA - tileB;
    });
  }, [filteredUsers, isLearningPathFiltered]);

  // Reset pagination to first page when filters change
  useEffect(() => {
    setPage(1);
  }, [filteredUsers]);

  if (len === 0) {
    return <ShowcaseEmptyResult id="showcase.usersList.noResult" />;
  }
  return (
    <section>
      <div className={noGrid ? styles.featuredCarousel : styles.showcaseCards}>
        {orderedUsers
          .slice((page - 1) * CARDS_PER_PAGE, page * CARDS_PER_PAGE)
          .map((user, index) => {
            // Compute global index for this user within orderedUsers
            const globalIndex = (page - 1) * CARDS_PER_PAGE + index;
            const tileNumber =
              isLearningPathFiltered || forceShowTileNumber
                ? user.tileNumber ?? globalIndex + 1
                : undefined;
            return (
              <React.Fragment key={user.title}>
                <ShowcaseCard
                  user={user}
                  coverPage={coverPage}
                  fixedHeight={noGrid ? 460 : undefined}
                  tileNumber={tileNumber}
                />
              </React.Fragment>
            );
          })}
      </div>
      {!noGrid && <Pagination page={page} totalPages={totalPages} setPage={setPage} />}
    </section>
  );
}

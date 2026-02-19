import React, { useState, useEffect, useMemo } from 'react';
import ShowcaseEmptyResult from '../states/ShowcaseEmptyResult';
import styles from '../../home/styles.module.css';
import ShowcaseListTile from '../cards/ShowcaseListTile';
import Pagination from '../../Pagination';
import { useLocation } from '@docusaurus/router';
import { LEARNING_PATH_TAGS } from '../../../constants/constants';
import { User } from 'src/data/tags';

export default function ShowcaseList({ filteredUsers }: { filteredUsers: User[] }) {
  // debug: removed console.log
  const usersCount = filteredUsers ? filteredUsers.length : 0;
  const CARDS_PER_PAGE = 6;
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(usersCount / CARDS_PER_PAGE);
  const location = useLocation();

  // Reset pagination to first page when filters change
  useEffect(() => {
    setPage(1);
  }, [filteredUsers]);

  const searchParams = new URLSearchParams(location.search);
  const currentTags = searchParams.getAll('tags');
  const isLearningPathFiltered = currentTags.some((tag) => LEARNING_PATH_TAGS.includes(tag));
  const orderedUsers = useMemo(() => {
    if (!isLearningPathFiltered) {
      return filteredUsers;
    }
    return [...filteredUsers].sort((userA, userB) => {
      const tileA = userA.tileNumber ?? Number.MAX_SAFE_INTEGER;
      const tileB = userB.tileNumber ?? Number.MAX_SAFE_INTEGER;
      if (tileA === tileB) {
        return (userA.order || 0) - (userB.order || 0);
      }
      return tileA - tileB;
    });
  }, [filteredUsers, isLearningPathFiltered]);

  if (usersCount === 0) {
    return <ShowcaseEmptyResult id="showcase.usersList.noResult" />;
  }
  return (
    <section>
      <div className={styles.showcaseList}>
        {orderedUsers.slice((page - 1) * CARDS_PER_PAGE, page * CARDS_PER_PAGE).map((user) => (
          <React.Fragment key={user.title}>
            <ShowcaseListTile
              user={user}
              tileNumber={isLearningPathFiltered && user.tileNumber ? user.tileNumber : undefined}
            />
          </React.Fragment>
        ))}
      </div>
      <Pagination page={page} totalPages={totalPages} setPage={setPage} />
    </section>
  );
}

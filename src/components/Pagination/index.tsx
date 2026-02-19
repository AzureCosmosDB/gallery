import React, { useMemo, useCallback } from 'react';
import { ChevronLeft24Regular, ChevronRight24Regular } from '@fluentui/react-icons';
import styles from './Pagination.module.css';
import { scrollToId } from '../../utils/scroll';

interface PaginationProps {
  page: number;
  totalPages: number;
  setPage: (page: number) => void;
  scrollTargetId?: string;
}

function getVisiblePages(page: number, totalPages: number): number[] {
  if (totalPages <= 1) return [];
  if (page <= 1) return totalPages >= 2 ? [1, 2] : [1];
  if (page >= totalPages) return totalPages >= 2 ? [totalPages - 1, totalPages] : [totalPages];
  return [page - 1, page, page + 1];
}

const Pagination: React.FC<PaginationProps> = ({
  page,
  totalPages,
  setPage,
  scrollTargetId = 'resource-library',
}) => {
  const visiblePages = useMemo(() => getVisiblePages(page, totalPages), [page, totalPages]);

  const handlePageChange = useCallback(
    (newPage: number) => {
      if (newPage < 1 || newPage > totalPages || newPage === page) return;
      setPage(newPage);
      if (typeof window !== 'undefined') {
        // scroll after next paint
        requestAnimationFrame(() => scrollToId(scrollTargetId));
      }
    },
    [page, setPage, totalPages, scrollTargetId]
  );

  if (totalPages <= 1) return null;

  return (
    <div className={styles.pagination}>
      <button
        type="button"
        className={styles.navButton}
        onClick={() => handlePageChange(page - 1)}
        disabled={page === 1}
      >
        <ChevronLeft24Regular className={styles.iconLeft} />
        Previous
      </button>

      <div className={styles.pages}>
        {visiblePages.map((p) => {
          const isActive = p === page;
          return (
            <button
              key={p}
              type="button"
              className={isActive ? styles.pageActive : styles.page}
              onClick={() => handlePageChange(p)}
              disabled={isActive}
              aria-current={isActive ? 'page' : undefined}
            >
              {p}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        className={styles.navButton}
        onClick={() => handlePageChange(page + 1)}
        disabled={page === totalPages}
      >
        Next
        <ChevronRight24Regular className={styles.iconRight} />
      </button>
    </div>
  );
};

export default Pagination;

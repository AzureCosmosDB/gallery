import React, { useState, useEffect } from "react";
import ShowcaseEmptyResult from "../components/gallery/ShowcaseEmptyResult";
import { type User } from "../data/tags-copy";
import styles from "./styles.module.css";
import ShowcaseListTile from "../components/gallery/ShowcaseListTile";
import Pagination from "../components/Pagination";
import { useLocation } from "@docusaurus/router";

export default function ShowcaseList({
  filteredUsers,
}: {
  filteredUsers: User[];
}) {
  const len = filteredUsers ? filteredUsers.length : 0;
  const CARDS_PER_PAGE = 6;
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(len / CARDS_PER_PAGE);
  const location = useLocation();

  // Reset pagination to first page when filters change
  useEffect(() => {
    setPage(1);
  }, [filteredUsers]);

  const searchParams = new URLSearchParams(location.search);
  const currentTags = searchParams.getAll("tags");
  const learningPathTags = [
    "developing-core-applications",
    "building-genai-apps",
    "building-ai-agents",
  ];
  const isLearningPathFiltered = currentTags.some((tag) =>
    learningPathTags.includes(tag)
  );

  if (len === 0) {
    return <ShowcaseEmptyResult id="showcase.usersList.noResult" />;
  }
  return (
    <section>
      <div className={styles.showcaseList}>
        {filteredUsers
          .slice((page - 1) * CARDS_PER_PAGE, page * CARDS_PER_PAGE)
          .map((user, idx) => (
            <React.Fragment key={user.title}>
              <ShowcaseListTile
                user={user}
                tileNumber={
                  isLearningPathFiltered
                    ? (page - 1) * CARDS_PER_PAGE + idx + 1
                    : undefined
                }
              />
            </React.Fragment>
          ))}
      </div>
      <Pagination page={page} totalPages={totalPages} setPage={setPage} />
    </section>
  );
}

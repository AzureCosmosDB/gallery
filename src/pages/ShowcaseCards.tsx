/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { useState, useEffect } from "react";
import ShowcaseEmptyResult from "../components/gallery/ShowcaseEmptyResult";
import { type User, type TagType } from "../data/tags";
import styles from "./styles.module.css";
import ShowcaseCard from "../components/gallery/ShowcaseCard";
import Pagination from "../components/Pagination";

export default function ShowcaseCards({
  filteredUsers,
  coverPage,
  noGrid = false,
}: {
  filteredUsers: User[];
  coverPage: boolean;
  noGrid?: boolean;
}) {
  const len = filteredUsers ? filteredUsers.length : 0;
  const CARDS_PER_PAGE = 6;
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(len / CARDS_PER_PAGE);

  // Reset pagination to first page when filters change
  useEffect(() => {
    setPage(1);
  }, [filteredUsers]);

  if (len === 0) {
    return <ShowcaseEmptyResult id="showcase.usersList.noResult" />;
  }
  return (
    <section>
      <div
        className={noGrid ? undefined : styles.showcaseCards}
        style={
          noGrid ? { display: "flex", flexDirection: "column" } : undefined
        }
      >
        {filteredUsers
          .slice((page - 1) * CARDS_PER_PAGE, page * CARDS_PER_PAGE)
          .map((user, index) => (
            <React.Fragment key={user.title}>
              <ShowcaseCard user={user} coverPage={coverPage} />
            </React.Fragment>
          ))}
      </div>
      {!noGrid && (
        <Pagination page={page} totalPages={totalPages} setPage={setPage} />
      )}
    </section>
  );
}

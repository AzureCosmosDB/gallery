import React from "react";
import { BookOpen, Library, Users } from "lucide-react";
import styles from "../HeroCover.module.css";
import { CoverCard } from "./CoverCard";
import type { HeroResourceLink } from "./types";

type Props = {
  heroResourceLinks: HeroResourceLink[];
  onLearningPaths: () => void;
  onCommunitySupport: () => void;
  onResourceLibrary: (tags?: string[]) => void;
};

export function CoverCardsRow({
  heroResourceLinks,
  onLearningPaths,
  onCommunitySupport,
  onResourceLibrary,
}: Props) {
  return (
    <div className={styles.cardsRow}>
      <CoverCard
        title="Learning Pathways"
        description="Structured learning pathways from beginner to advanced"
        icon={<BookOpen size={40} className={styles.iconBlue} />}
        className={styles.cardBlueBorder}
        onClick={onLearningPaths}
      />

      <CoverCard
        title="Resource Library"
        icon={<Library size={40} className={styles.iconGreen} />}
        className={styles.cardGreen}
        onClick={() => onResourceLibrary([])}
      >
        <span className={styles.cardLinks} onClick={(e) => e.stopPropagation()}>
          <a
            href="#resource-library"
            className={styles.resourceLink}
            onClick={(e) => {
              e.preventDefault();
              onResourceLibrary(["documentation", "tutorial", "how-to"]);
            }}
          >
            Tutorials
          </a>
          <span className={styles.linkSeparator}> | </span>

          <a
            href="#resource-library"
            className={styles.resourceLink}
            onClick={(e) => {
              e.preventDefault();
              onResourceLibrary(["solution-accelerator"]);
            }}
          >
            Solution Accelerator
          </a>
          <span className={styles.linkSeparator}> | </span>

          <a
            href="#resource-library"
            className={styles.resourceLink}
            onClick={(e) => {
              e.preventDefault();
              onResourceLibrary(["training", "workshop"]);
            }}
          >
            Trainings
          </a>
          <span className={styles.linkSeparator}> | </span>

          <a
            href="#resource-library"
            className={styles.resourceLink}
            onClick={(e) => {
              e.preventDefault();
              onResourceLibrary(["video"]);
            }}
          >
            Videos
          </a>
          <span className={styles.linkSeparator}> | </span>

          <a
            href="#resource-library"
            className={styles.resourceLink}
            onClick={(e) => {
              e.preventDefault();
              onResourceLibrary(["blog"]);
            }}
          >
            Blogs
          </a>
        </span>
      </CoverCard>

      <CoverCard
        title="Community & Support"
        description="Connect with developers and get expert help"
        icon={<Users size={40} className={styles.iconPurple} />}
        className={styles.cardPurple}
        onClick={onCommunitySupport}
      />
    </div>
  );
}

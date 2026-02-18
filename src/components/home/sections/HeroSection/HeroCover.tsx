import React from "react";
import { Title3, Display } from "@fluentui/react-components";
import useBaseUrl from "@docusaurus/useBaseUrl";
import styles from "./HeroCover.module.css";

import {
  HERO_TITLE,
  HERO_DESCRIPTION,
  HERO_SUB_DESCRIPTION,
  HERO_RESOURCE_LINKS,
} from "../../../../constants/constants";

import { useScrollToSection } from "./hooks/useScrollToSection";
import { useResourceLibraryNavigation } from "./hooks/useResourceLibraryNavigation";
import { CoverCardsRow } from "./cards/CoverCardsRow";

const RESOURCE_SECTION_ID = "resource-library";
const LEARNING_PATHS_ID = "learning-paths";
const COMMUNITY_SUPPORT_ID = "community-support";

export default function HeroCover() {
  const bgUrl = useBaseUrl("/img-optimized/dotted-background-opacity40.png");

  const scrollToSection = useScrollToSection();
  const { navigateToResourceLibrary } =
    useResourceLibraryNavigation(RESOURCE_SECTION_ID);

  return (
    <div className={styles.coverPageContainer}>
      <div
        className={styles.coverPageAreaContainer}
        style={{ backgroundImage: `url(${bgUrl})` }}
      >
        <div className={styles.coverPageArea}>
          <div className={styles.titleSection}>
            <span className={styles.heroTextWrapper}>
              <Display className={styles.heroTitle}>{HERO_TITLE}</Display>
              <Title3 className={styles.greyText}>
                {HERO_SUB_DESCRIPTION}
              </Title3>
            </span>

            <Title3 className={styles.centeredDescription}>
              {HERO_DESCRIPTION}
            </Title3>

            <CoverCardsRow
              heroResourceLinks={HERO_RESOURCE_LINKS}
              onLearningPaths={() => scrollToSection(LEARNING_PATHS_ID)}
              onCommunitySupport={() => scrollToSection(COMMUNITY_SUPPORT_ID)}
              onResourceLibrary={(tags) =>
                navigateToResourceLibrary(tags ?? [])
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { useLocation } from '@docusaurus/router';
import styles from './styles.module.css';

import { featuredUsers, type User } from '../../../../data/users';
import type { LearningPath } from './types';
import { getDefaultPathsFromConfig } from './utils/pathsFromConfig';
import { getAllParams } from './utils/url';
import { LEARNING_PATH_FILTER_TAGS } from './constants';
import { useLearningPathNavigation } from './hooks/useLearningPathNavigation';
import { LearningPathTile } from './components/LearningPathTile';
import { FeaturedResourcesSlider } from './components/FeaturedResourcesSlider';

const defaultPaths = getDefaultPathsFromConfig();

export default function LearningPathsSection({ paths = defaultPaths }: { paths?: LearningPath[] }) {
  const location = useLocation();
  const { goToResourceLibraryWithTag } = useLearningPathNavigation();

  const currentTags = getAllParams(location.search, 'tags');
  const isLearningPathFiltered = currentTags.some((t) =>
    (LEARNING_PATH_FILTER_TAGS as readonly string[]).includes(t)
  );

  return (
    <section className={styles.learningPathsSection}>
      <div className={styles.left}>
        <h2 className={styles.heading}>Learning Pathways</h2>
        <div className={styles.sectionDesc}>
          Choose from structured learning pathways designed to guide you through PostgreSQL
          development on Azure, from basic application development to advanced AI integration.
        </div>

        <div className={styles.tiles}>
          {paths.map((path) => (
            <LearningPathTile
              key={path.id}
              path={path}
              onClick={() => goToResourceLibraryWithTag(path.filterTag)}
            />
          ))}
        </div>
      </div>

      <div className={styles.right}>
        <h2 className={styles.heading}>Featured Resources</h2>
        <div className={styles.sectionDesc}>
          Discover our latest and most popular resources, including comprehensive guides, tutorials,
          and solution accelerators.
        </div>

        <FeaturedResourcesSlider
          featuredUsers={featuredUsers as unknown as User[]}
          forceShowTileNumber={isLearningPathFiltered}
        />
      </div>
    </section>
  );
}

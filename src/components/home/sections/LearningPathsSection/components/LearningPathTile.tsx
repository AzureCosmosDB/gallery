import React from 'react';
import { ArrowRight } from 'lucide-react';
import styles from '../styles.module.css';
import type { LearningPath } from '../types';
import { renderPathIcon } from '../utils/icons';

export function LearningPathTile({ path, onClick }: { path: LearningPath; onClick: () => void }) {
  return (
    <button type="button" className={styles.tile} onClick={onClick}>
      <div className={styles.icon}>{renderPathIcon(path)}</div>

      <div className={styles.tileContent}>
        <div className={styles.tileTitle}>{path.title}</div>
        <div className={styles.tileDesc}>{path.description}</div>

        <div className={styles.tagsRow}>
          <span className={styles.levelChip}>{path.level}</span>
          <span className={styles.durationChip}>{path.duration}</span>
        </div>

        <div className={styles.tags}>
          {path.tags.map((tag) => (
            <span className={styles.chip} key={tag}>
              {tag}
            </span>
          ))}
        </div>
      </div>

      <ArrowRight size={20} className={styles.arrow} />
    </button>
  );
}

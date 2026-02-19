import React from 'react';
import styles from './styles.module.css';
import { User as UserIcon, Calendar, Clock } from 'lucide-react';

type Meta = { author?: string; date?: string; duration?: string };

export default function MetaInfoRow({ meta }: { meta?: Meta }) {
  if (!meta || (!meta.author && !meta.date && !meta.duration)) return null;

  return (
    <div className={styles.metaInfo}>
      {meta.author && (
        <div className={styles.metaItem}>
          <UserIcon size={16} />
          <span>{meta.author}</span>
        </div>
      )}
      {meta.date && (
        <div className={styles.metaItem}>
          <Calendar size={16} />
          <span>
            {new Date(meta.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </span>
        </div>
      )}
      {meta.duration && (
        <div className={styles.metaItem}>
          <Clock size={16} />
          <span>{meta.duration}</span>
        </div>
      )}
    </div>
  );
}

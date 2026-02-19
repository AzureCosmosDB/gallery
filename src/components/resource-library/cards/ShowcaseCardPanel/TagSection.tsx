import React from 'react';
import styles from './styles.module.css';
import CardPanelTag from './CardPanelTag';
import { Tag } from '../../../../data/tags';

export default function TagSection({ title, tags }: { title: string; tags: Tag[] }) {
  if (!tags.length) return null;

  return (
    <>
      <div className={styles.subTitle2}>{title}</div>
      <CardPanelTag tags={tags} />
    </>
  );
}

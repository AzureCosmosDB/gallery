import React from 'react';
import { Title1, Title3 } from '@fluentui/react-components';
import styles from '../../../styles.module.css';

export function HeaderSection() {
  return (
    <div className={styles.titleSection}>
      <Title1 className={styles.resourceTitle}>Resource Library</Title1>
      <Title3 className={styles.centeredDescription}>
        Explore our comprehensive collection of documentation, tutorials, videos, and solution
        accelerators to help you build amazing applications with PostgreSQL on Azure.
      </Title3>
    </div>
  );
}

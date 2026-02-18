import React from 'react';
import styles from '../CommunitySupportSection.module.css';
import type { CommunityCardType } from '../types';
import { getLucideIcon } from '../utils/icons';
import { CommunityCardEvents } from './CommunityCardEvents';
import { CommunityCardActions } from './CommunityCardActions';

export function CommunityCard({ card }: { card: CommunityCardType }) {
  const Icon = getLucideIcon(card.icon);

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.iconBg} style={{ background: card.iconBg || '#e6f0fa' }}>
          <Icon
            className={styles.cardIcon}
            size={22}
            style={{ color: card.iconColor || '#1960fc' }}
          />
        </span>
        <span className={styles.cardTitle}>{card.title}</span>
      </div>

      <div className={styles.cardDesc}>{card.desc}</div>

      {card.events ? <CommunityCardEvents events={card.events} /> : null}

      <CommunityCardActions card={card} />
    </div>
  );
}

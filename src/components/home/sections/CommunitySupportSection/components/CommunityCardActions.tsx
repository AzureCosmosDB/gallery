import React from 'react';
import * as LucideIcons from 'lucide-react';
import styles from '../CommunitySupportSection.module.css';
import { TwitterXIcon } from '@site/src/theme/Icon/TwitterXIcon';
import type { CardAction, CommunityCardType } from '../types';
import { isExternal } from '../utils/external';
import { getLucideIcon } from '../utils/icons';

function resolveActionIcon(icon?: string) {
  if (!icon) return null;
  if (icon === 'X') return <TwitterXIcon size={18} />;
  if (icon === 'X') return <TwitterXIcon size={18} />;

  const Comp = getLucideIcon(icon, false);
  return Comp ? <Comp size={18} style={{ minWidth: 18 }} /> : null;
}

export function CommunityCardActions({
  card,
}: {
  card: Pick<CommunityCardType, 'actions' | 'layout'>;
}) {
  const stacked = card.layout === 'stackedActions';

  return (
    <div className={`${styles.cardActions} ${stacked ? styles.cardActionsStacked : ''}`}>
      {card.actions.map((action: CardAction) => {
        const outlined = action.variant === 'outlined';
        const fullWidth = action.fullWidth || stacked;
        const external = isExternal(action.href);

        return (
          <a
            key={`${action.label}-${action.href}`}
            href={action.href}
            className={outlined ? styles.cardActionBtnOutlined : styles.cardActionBtn}
            data-fullwidth={fullWidth ? 'true' : 'false'}
            target={external ? '_blank' : undefined}
            rel={external ? 'noopener noreferrer' : undefined}
          >
            {resolveActionIcon(action.icon)}
            {action.label}
          </a>
        );
      })}
    </div>
  );
}

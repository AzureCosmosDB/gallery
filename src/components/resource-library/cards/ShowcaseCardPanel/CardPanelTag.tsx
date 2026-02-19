import React from 'react';
import { Link } from '@fluentui/react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';
import { Tag } from '../../../../data/tags';

function CardPanelTag({ tags }: { tags: Tag[] }) {
  return (
    <>
      {tags.map((item, index) => {
        const label = item.label;
        const subType = item.subType;
        return !subType && item.type != 'Azure' ? (
          <div key={label} className={styles.cardPanelTag}>
            {/* <div className={styles.icon}>
              <img src={useBaseUrl(item.icon)} alt={label} height={20} />
            </div> */}
            <div className={styles.iconText}>{label}</div>
          </div>
        ) : (
          <div key={label} className={styles.cardPanelTag}>
            {/* {subType ? (
              <div className={styles.icon}>
                <img
                  src={useBaseUrl(item.subType.icon)}
                  alt={label}
                  height={20}
                />
              </div>
            ) : (
              <div className={styles.icon}>
                <img src={useBaseUrl(item.icon)} alt={label} height={20} />
              </div>
            )} */}
            <div className={styles.iconTextGroup}>
              <div className={styles.iconText}>{label}</div>
              <div className={styles.iconLearnMoreGroup}>
                {subType ? <div>{subType?.[0]?.label}</div> : <div>Azure</div>}
                <div>•</div>
                <Link href={item.url} target="_blank" className={styles.iconLink}>
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}

export default CardPanelTag;

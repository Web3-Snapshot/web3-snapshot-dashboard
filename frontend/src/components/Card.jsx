import React from 'react';
import { useLocation } from 'react-router-dom';
import styles from './Card.module.scss';
import { useBreakpoints } from 'react-breakpoints-hook';
import { BREAKPOINTS } from '../constants';
import GroupingHeader from './GroupingHeader';

function Card({ tableData, coin, onCardClick }) {
  const location = useLocation();

  let { mobile, tablet } = useBreakpoints(BREAKPOINTS);

  return (
    <div className={styles.cardContainer} onClick={(evt) => onCardClick(evt, coin, null)}>
      <div className={styles.cardHeader}>
        {tableData
          .slice(0, 3) // The first 3 items go into the header
          .map((item) => (
            <div key={item.id} className={styles.cardHeaderCell}>
              <span className={styles.cardHeaderCellLabel}>{item.label}</span>
              <div className={styles.cardHeaderCellValue}>{item.render(coin)}</div>
            </div>
          ))}
      </div>
      <div>
        {(mobile || tablet) && location.pathname === '/tokenomics' && <GroupingHeader />}
        <div className={styles.cardBody}>
          {tableData
            .slice(3) // All the rest gos into the content area
            .map((item) => (
              <div key={item.id} className={styles.cardBodyCell}>
                <div>{item.render(coin)}</div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

export default Card;

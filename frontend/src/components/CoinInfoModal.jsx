import React from 'react';
import styles from './CoinInfoModal.module.css';
import IconAndCurrencyIdCell from './IconAndCurrencyIdCell';
import { Markup } from 'interweave';
import { convertSnakeCaseToStringRrepresentation } from '../util/helpers';

function CoinInfoModal({ onClose, row }) {
  function handleBackdropClick(evt) {
    evt.stopPropagation();
    onClose();
  }

  return (
    <div className={styles.backdrop} onClick={handleBackdropClick}>
      <div
        className={styles.dialogRoot}
        onClick={(evt) => {
          evt.stopPropagation();
        }}>
        <div className={styles.dialogContent}>
          <div className={styles.dialogHeader}>
            <IconAndCurrencyIdCell obj={row} />
          </div>
          <div className={styles.dialogBody}>
            {['categories', 'homepage', 'blockchain_site', 'genesis_date', 'hashing_algorithm'].map(
              (item) => (
                <div className={styles.dialogPropertyPair}>
                  <div>{convertSnakeCaseToStringRrepresentation(item)}</div>
                  <div>{row[item] || '-'}</div>
                </div>
              )
            )}
            {[
              'coingecko_score',
              'developer_score',
              'community_score',
              'liquidity_score',
              'public_interest_score',
            ].map((score) => {
              return (
                <div className={styles.dialogPropertyPair}>
                  <div>{convertSnakeCaseToStringRrepresentation(score)}</div>
                  <div>{row[score]}</div>
                </div>
              );
            })}
            <p className={styles.coinDescription}>
              <Markup content={row.description}></Markup>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CoinInfoModal;

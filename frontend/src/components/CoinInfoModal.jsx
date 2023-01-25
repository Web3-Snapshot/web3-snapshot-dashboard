import React from 'react';
import styles from './CoinInfoModal.module.css';
import IconAndCurrencyIdCell from './IconAndCurrencyIdCell';
import { Markup } from 'interweave';

function convertSnakeCaseToStringRrepresentation(string) {
  return string.split('_').reduce((acc, curr) => {
    acc += ` ${curr.slice(0, 1).toUpperCase()}${curr.slice(1)}`;
    return acc;
  }, '');
}

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
            <div className={styles.dialogPropertyPair}>
              <div>Categories</div>
              <div>{row.categories}</div>
            </div>
            <div className={styles.dialogPropertyPair}>
              <div>HomePage</div>
              <div>{row.homepage}</div>
            </div>
            <div className={styles.dialogPropertyPair}>
              <div>Blockchain site</div>
              <div>{row.blockchain_site}</div>
            </div>
            <div className={styles.dialogPropertyPair}>
              <div>Genesis Date</div>
              <div>{row.genesis_date}</div>
            </div>
            <div className={styles.dialogPropertyPair}>
              <div>Hashing Algorithm</div>
              <div>{row.hashing_algorithm}</div>
            </div>
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

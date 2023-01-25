import React from 'react';
import styles from './CoinInfoModal.module.css';
import IconAndCurrencyIdCell from './IconAndCurrencyIdCell';
import { Markup } from 'interweave';

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
          <p className={styles.coinDescription}>
            <Markup content={row.description}></Markup>
          </p>
        </div>
      </div>
    </div>
  );
}

export default CoinInfoModal;

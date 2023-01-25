import React, { useEffect } from 'react';
import styles from './CoinInfoModal.module.css';

function CoinInfoModal({ onClose, row }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

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
        {Object.values(row).map((item, idx) => {
          return <p key={`${row.id}-${idx}`}>{item}</p>;
        })}
      </div>
    </div>
  );
}

export default CoinInfoModal;

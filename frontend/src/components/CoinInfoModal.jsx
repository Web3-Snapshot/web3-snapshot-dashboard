import React, { useRef } from 'react';
import styles from './CoinInfoModal.module.scss';
import { capitalize } from '../util/helpers';
import { Markup } from 'interweave';
import { Link } from 'react-router-dom';
import { Scrollbars } from 'react-custom-scrollbars';

function CoinInfoModal({ onClose, row }) {
  const homepage = useRef(null);
  homepage.current = row.homepage.split(',')[0];
  const icon = useRef(null);
  icon.current = row.image_thumb;

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
        {icon.current && (
          <div className={styles.dialogContent}>
            <div className={styles.dialogHeader}>
              <img src={icon.current} alt="coin" />
              <div className={styles.coinName}>
                <h2>{capitalize(row.id)}</h2>
              </div>
              <div className={styles.coinSymbol}>
                <p>{row.symbol.toUpperCase()}</p>
              </div>
            </div>
            <div className={styles.dialogBody}>
              <Scrollbars
                renderView={(props) => <div {...props} className="scrollbarView" />}
                autoHeight
                autoHeightMin={300} // min-height and max-height must be set lower
                autoHeightMax={400} // than the height of the dialogRoot
              >
                <p className={styles.coinDescription}>
                  <Markup content={row.description}></Markup>
                </p>
              </Scrollbars>
              <div className={styles.homepageLink}>
                <Link to={homepage.current} target="_blank">
                  {homepage.current}
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CoinInfoModal;

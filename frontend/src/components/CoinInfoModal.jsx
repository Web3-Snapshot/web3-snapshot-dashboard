import React, { useState, useEffect, useRef } from 'react';
import { Markup } from 'interweave';
import { CgClose } from 'react-icons/cg';
import { Link } from 'react-router-dom';

import { fetchCoin } from '../shared/api';
import styles from './CoinInfoModal.module.scss';
import { capitalize, removeTags } from '../utils/helper_functions';
import { Scrollbars } from 'react-custom-scrollbars';

const modalDimensions = {
  minHeight: 300, // min-height and max-height must be set lower
  maxHeight: 400, // than the height of the dialogRoot
};

function CoinInfoModal({ coinId, onClose }) {
  const [coin, setCoin] = useState(null);
  const homepage = useRef(null);
  const icon = useRef(null);
  homepage.current = coin?.homepage?.[0] || '';
  icon.current = coin?.image.large;

  useEffect(() => {
    const fetchData = async function () {
      fetchCoin(coinId)
        .then((res) => {
          setCoin(res);
        })
        .catch((err) => {
          console.error(err);
          setCoin(null);
        });
    };

    if (coinId) {
      fetchData();
    }
  }, [coinId]);

  function handleBackdropClick(evt) {
    evt.stopPropagation();
    onClose();
  }

  return (
    <>
      <div className={styles.backdrop} onClick={handleBackdropClick}>
        <div
          className={styles.dialogRoot}
          onClick={(evt) => {
            evt.stopPropagation();
          }}>
          <CgClose className={styles.closeIcon} onClick={handleBackdropClick}></CgClose>
          {coin ? (
            <>
              {icon.current && (
                <div className={styles.dialogContent}>
                  <div className={styles.dialogHeader}>
                    <img src={icon.current} alt="coin" />
                    <div className={styles.coinName}>
                      <h2>{capitalize(coin.id)}</h2>
                    </div>
                    <div className={styles.coinSymbol}>
                      <p>{coin.symbol.toUpperCase()}</p>
                    </div>
                  </div>
                  <div className={styles.dialogBody}>
                    <Scrollbars
                      renderView={(props) => <div {...props} className="scrollbarView" />}
                      autoHeight
                      autoHeightMin={modalDimensions.minHeight}
                      autoHeightMax={modalDimensions.maxHeight}>
                      <div className={styles.coinDescription}>
                        <Markup content={removeTags(coin.description)}></Markup>
                      </div>
                    </Scrollbars>
                    <div className={styles.homepageLink}>
                      {homepage && (
                        <Link to={homepage.current} target="_blank">
                          {homepage.current}
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className={styles.dialogContent}>
              <div className={styles.dialogBody}>
                <h3>We currently don't have any more specific data for this coin.</h3>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default CoinInfoModal;

import React from 'react';
import styles from './Footer.module.scss';
import coingeckoLogo from '../assets/coingecko_logo.svg';

function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.content}>
        <p className={styles.credits}>
          Designed and built by Marco Bagni and Magnus Henkel
        </p>
        <p className={styles.source}>
          Source: <a href="https://www.coingecko.com" target="_blank" rel="noopener noreferrer" className={styles.link}>
            <img src={coingeckoLogo} alt="CoinGecko" className={styles.logo} />
          </a>
        </p>
      </div>
    </footer>
  );
}

export default Footer;
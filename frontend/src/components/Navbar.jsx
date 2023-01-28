import React from 'react';
import { FaCoins } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import styles from './Navbar.module.scss';

function Navbar() {
  return (
    <div>
      <Link to="/">
        <div className={styles.navbar}>
          <FaCoins className={styles.icon} />
          <h1> Web3 Dashboard</h1>
        </div>
      </Link>
    </div>
  );
}

export default Navbar;

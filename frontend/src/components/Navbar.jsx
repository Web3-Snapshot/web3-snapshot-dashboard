import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Navbar.module.scss';

function Navbar() {
  return (
    <div>
      <Link to="/">
        <div className={styles.navbar}>
          <h1> Web3</h1>
          <h2> SNAPSHOT</h2>
        </div>
      </Link>
    </div>
  );
}

export default Navbar;

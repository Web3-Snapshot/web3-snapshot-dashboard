import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Navbar.module.scss';
import { ReactComponent as Logo } from '../assets/Web3snapshot_logo.svg';

function Navbar() {
  return (
    <div>
      <Link to="/">
        <div className={styles.navbar}>
          <Logo />
        </div>
      </Link>
    </div>
  );
}

export default Navbar;

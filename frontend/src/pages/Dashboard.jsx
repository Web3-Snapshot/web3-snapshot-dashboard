import React, { useState, useEffect } from 'react';
import { v4 as uuid } from 'uuid';
import { isEmpty } from 'lodash';
import { NavLink, Outlet } from 'react-router-dom';
import axios from 'axios';
import styles from './Dashboard.module.css';
import navbarStyles from '../components/Navbar.module.css';

export async function fetchCoins() {
  return axios({
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    url: '/api/coins',
  })
    .then((res) => {
      console.log(res.data);
      return res.data;
    })
    .catch((err) => {
      throw new Error(err);
    });
}

function Dashboard() {
  const [coins, setCoins] = useState({ data: {}, order: [] });

  useEffect(() => {
    const fetchData = async function () {
      fetchCoins().then((res) => {
        const normalizedRes = res.reduce(
          (acc, curr) => {
            const guid = uuid();
            acc.data = { ...acc.data, [guid]: curr };
            acc.order.push(guid);
            return acc;
          },
          { data: {}, order: [] }
        );
        console.log('normalizedRes', normalizedRes);
        setCoins(normalizedRes);
      });
    };

    if (isEmpty(coins.data)) {
      fetchData();
    }
  }, [coins]);

  return (
    <div className={styles.root}>
      <nav className={styles.navigation}>
        <NavLink to="/prices">
          {({ isActive }) => (
            <button className={isActive ? navbarStyles.active : undefined}>PRICES</button>
          )}
        </NavLink>
        <NavLink to="/supply">
          {({ isActive }) => (
            <button className={isActive ? navbarStyles.active : undefined}>SUPPLY</button>
          )}
        </NavLink>
      </nav>
      {!isEmpty(coins) && (
        <main>
          <Outlet context={{ coins }} />
        </main>
      )}
    </div>
  );
}

export default Dashboard;

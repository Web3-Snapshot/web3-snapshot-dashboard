import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { isEmpty } from 'lodash';
import { NavLink, Outlet } from 'react-router-dom';
import styles from './Dashboard.module.scss';
import navbarStyles from '../components/Navbar.module.scss';
import DisclaimerMessage from '../components/DisclaimerMessage';
import { useIsIframe } from '../custom-hooks/useIsIframe';
import { normalizeResponse } from '../util/helpers';

async function fetchCoins() {
  return axios
    .get('/api/coins')
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
  const isIframe = useIsIframe();
  const initalDataFetchDone = useRef(false);

  useEffect(() => {
    const fetchData = async function () {
      fetchCoins().then((res) => {
        console.log(res);
        const normalizedRes = normalizeResponse(res);
        setCoins(normalizedRes);
      });
    };

    fetchData();
    initalDataFetchDone.current = true;
  }, []);

  useEffect(() => {
    if (!initalDataFetchDone.current) return;

    const sse = new EventSource('/api/coin-stream');

    function handleStream(evt) {
      console.log('evt.data', evt.data);
      const res = JSON.parse(evt.data);
      const normalizedRes = normalizeResponse(res);
      console.log('normalizedRes', normalizedRes);
      setCoins(normalizedRes);
    }

    sse.onmessage = (evt) => {
      handleStream(evt);
    };

    sse.onerror = () => {
      sse.close();
    };

    return () => {
      sse.close();
    };
  });

  return (
    <div className={styles.root}>
      {!isIframe && (
        <nav className={styles.navigation}>
          <NavLink to="/prices">
            {({ isActive }) => (
              <button className={`${isActive && navbarStyles.active} ${styles.tabNavButton}`}>
                PRICES
              </button>
            )}
          </NavLink>
          <NavLink to="/tokenomics">
            {({ isActive }) => (
              <button className={`${isActive && navbarStyles.active} ${styles.tabNavButton}`}>
                TOKENOMICS
              </button>
            )}
          </NavLink>
        </nav>
      )}
      {!isEmpty(coins.data) && (
        <main>
          <DisclaimerMessage />
          <Outlet context={{ coins }} />
        </main>
      )}
    </div>
  );
}

export default Dashboard;

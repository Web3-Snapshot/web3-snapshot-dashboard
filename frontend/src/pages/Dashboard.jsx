import React, { useState, useEffect } from 'react';
import { v4 as uuid } from 'uuid';
import { isEmpty } from 'lodash';
import { NavLink, Outlet } from 'react-router-dom';
import styles from './Dashboard.module.scss';
import navbarStyles from '../components/Navbar.module.scss';
import DisclaimerMessage from '../components/DisclaimerMessage';
import { useIsIframe } from '../custom-hooks/useIsIframe';

function Dashboard() {
  const [coins, setCoins] = useState({ data: {}, order: [] });
  const isIframe = useIsIframe();

  useEffect(() => {
    const sse = new EventSource('/api/coins');

    function handleStream(evt) {
      console.log('evt.data', evt.data);
      const res = JSON.parse(evt.data);
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

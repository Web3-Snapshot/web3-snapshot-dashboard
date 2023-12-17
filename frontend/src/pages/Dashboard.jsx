import React, { useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import styles from './Dashboard.module.scss';
import navbarStyles from '../components/Navbar.module.scss';
import DisclaimerMessage from '../components/DisclaimerMessage';
import { useIsIframe } from '../custom-hooks/useIsIframe';
import { usePricesStore } from '../components/Prices/state';

function Dashboard() {
  const isIframe = useIsIframe();
  const setRows = usePricesStore((state) => state.setRows);
  const setUpdatedAt = usePricesStore((state) => state.setUpdatedAt);

  useEffect(() => {
    // if (!initalDataFetchDone.current) return;
    const sse = new EventSource('/api/coin-stream');

    function handleStream(evt) {
      console.log('evt.data', evt.data);
      const res = JSON.parse(evt.data);
      setRows(res.payload);
      setUpdatedAt(res.updated_at);
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
      <main>
        <DisclaimerMessage />
        <Outlet />
      </main>
    </div>
  );
}

export default Dashboard;

import React, { useState, useEffect } from "react";
import { isEmpty } from "lodash";
import { NavLink, Outlet } from "react-router-dom";
import axios from "axios";
import styles from "./Dashboard.module.css";
import navbarStyles from "../components/Navbar.module.css";

export async function fetchCoins() {
  return axios({
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    url: "/api/coins",
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
  const [coins, setCoins] = useState([]);

  useEffect(() => {
    const fetchData = async function () {
      fetchCoins().then((res) => setCoins(res));
    };

    if (coins.length < 1) {
      fetchData();
    }
  }, [coins]);

  return (
    <div className={styles.root}>
      <nav className={styles.navigation}>
        <NavLink to='/prices'>
          {({ isActive }) => (
            <button className={isActive ? navbarStyles.active : undefined}>
              PRICES
            </button>
          )}
        </NavLink>
        <NavLink to='/supply'>
          {({ isActive }) => (
            <button className={isActive ? navbarStyles.active : undefined}>
              SUPPLY
            </button>
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

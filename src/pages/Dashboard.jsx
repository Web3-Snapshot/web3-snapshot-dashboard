import React, { useState, useEffect } from "react";
import { NavLink, Outlet } from "react-router-dom";
import axios from "axios";
import { PAGES } from "../constants";

export async function fetchCoins() {
  const marketsUrl = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${PAGES}&page=1&sparkline=false&price_change_percentage=1h%2C%2024h%2C%207d%2C%2030d%2C%20200d%2C%201y%2C%203y`;
  return axios({
    method: "GET",
    url: marketsUrl,
  })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      throw new Error(err);
    });
}

function Dashboard() {
  const [coins, setCoins] = useState([]);

  useEffect(() => {
    fetchCoins().then((res) => setCoins(res));
  }, []);

  return (
    <div>
      {coins.length > 0 && (
        <>
          <nav>
            <NavLink to='/prices'>
              {({ isActive }) => (
                <button className={isActive ? "active" : undefined}>
                  PRICES
                </button>
              )}
            </NavLink>
            <NavLink to='/supply'>
              {({ isActive }) => (
                <button className={isActive ? "active" : undefined}>
                  SUPPLY
                </button>
              )}
            </NavLink>
          </nav>
          <main>
            <Outlet context={{ coins }} />
          </main>
        </>
      )}
    </div>
  );
}

export default Dashboard;

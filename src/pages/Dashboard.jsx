import React, { useState, useEffect } from "react";
import { NavLink, Outlet } from "react-router-dom";
import axios from "axios";
import { PAGES } from "../constants";
import "./DashboardPage.css";

export async function fetchCoins() {
  const marketsUrl = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${PAGES}&page=1&sparkline=false&price_change_percentage=1h%2C%2024h%2C%207d%2C%2030d%2C%20200d%2C%201y%2C%203y`;
  return axios({
    method: "GET",
    headers: {
      "Access-Control-Allow-Origin": "https://api.coingecko.com/api/v3",
      "Content-Type": "application/json",
    },
    url: marketsUrl,
  })
    .then((res) => {
      console.log(res.data);
      return res.data;
    })
    .catch((err) => {
      throw new Error(err);
    });
}

export async function fetchCoinProperties(coins) {
  const endpoints = coins.map((coin) => {
    return `https://api.coingecko.com/api/v3/coins/${coin.id}`;
  });

  return Promise.all(
    endpoints.map((endpoint) =>
      axios({
        method: "GET",
        headers: {
          "Access-Control-Allow-Origin": "https://api.coingecko.com/api/v3",
          "Content-Type": "application/json",
        },
        url: endpoint,
      })
    )
  )
    .then((res) => {
      const dataObj = {};
      res.forEach((item) => {
        dataObj[[item.data.id]] = item.data;
      });

      console.log(dataObj);
      return dataObj;
    })
    .catch((err) => {
      throw new Error(err);
    });
}

function Dashboard() {
  const [coins, setCoins] = useState([]);
  const [coinProperties, setCoinProperties] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      fetchCoins()
        .then((res) => {
          setCoins(res);
          return res;
        })
        .then((res) => {
          fetchCoinProperties(res).then((res) => {
            setCoinProperties(res);
          });
        });
    };
    fetchData();
  }, [coins, coinProperties]);

  return (
    <div>
      <nav className='navigation'>
        <NavLink to='/prices'>
          {({ isActive }) => (
            <button className={isActive ? "active" : undefined}>PRICES</button>
          )}
        </NavLink>
        <NavLink to='/supply'>
          {({ isActive }) => (
            <button className={isActive ? "active" : undefined}>SUPPLY</button>
          )}
        </NavLink>
      </nav>
      {coins.length > 0 && (
        <main>
          <Outlet context={{ coins, coinProperties }} />
        </main>
      )}
    </div>
  );
}

export default Dashboard;

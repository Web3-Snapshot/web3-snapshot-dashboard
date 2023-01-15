import React, { useState, useEffect } from "react";
import { isEmpty } from "lodash";
import { NavLink, Outlet } from "react-router-dom";
import axios from "axios";
import { COINS } from "../constants";
import styles from "./Dashboard.module.css";
import navbarStyles from "../components/Navbar.module.css";

// export async function fetchCoins() {
//   const marketsUrl = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${COINS}&page=1&sparkline=false&price_change_percentage=1h%2C%2024h%2C%207d%2C%2030d%2C%20200d%2C%201y%2C%203y`;
//   return axios({
//     method: "GET",
//     headers: {
//       "Access-Control-Allow-Origin": "https://api.coingecko.com/api/v3",
//       "Content-Type": "application/json",
//     },
//     url: marketsUrl,
//   })
//     .then((res) => {
//       console.log(res.data);
//       return res.data;
//     })
//     .catch((err) => {
//       throw new Error(err);
//     });
// }

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

// export async function fetchCoinProperties(coins) {
//   const endpoints = coins.map((coin) => {
//     return `https://api.coingecko.com/api/v3/coins/${coin.id}`;
//   });

//   return Promise.all(
//     endpoints.map((endpoint) =>
//       axios({
//         method: "GET",
//         headers: {
//           "Access-Control-Allow-Origin": "https://api.coingecko.com/api/v3",
//           "Content-Type": "application/json",
//         },
//         url: endpoint,
//       })
//     )
//   )
//     .then((res) => {
//       const dataObj = {};
//       res.forEach((item) => {
//         dataObj[[item.data.id]] = item.data;
//       });

//       console.log(dataObj);
//       return dataObj;
//     })
//     .catch((err) => {
//       throw new Error(err);
//     });
// }

function Dashboard() {
  const [coins, setCoins] = useState([]);
  // const [coinProperties, setCoinProperties] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      fetchCoins()
        .then((res) => {
          setCoins(res);
          return res;
        })
        .then((res) => {
          // fetchCoinProperties(res).then((res) => {
          // setCoinProperties(res);
          // });
        });
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
          {/* <Outlet context={{ coinProperties }} /> */}
          <Outlet context={{ coins }} />
        </main>
      )}
    </div>
  );
}

export default Dashboard;

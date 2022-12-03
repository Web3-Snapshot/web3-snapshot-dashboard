import React, { useState, useEffect } from "react";
import axios from "axios";
import CoinItem from "./CoinItem-1";
import Coin from "../routes/Coin";
import { Link } from "react-router-dom";
import { PAGES } from "../constants";

import "./Coins.css";

async function fetchCoins() {
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

function Prices() {
  const [coins, setCoins] = useState([]);

  useEffect(() => {
    fetchCoins().then((res) => setCoins(res));
  }, []);

  const headCells = [
    { id: "number", label: "#" },
    { id: "coin", label: "Coin" },
    { id: "price", label: "Price" },
    { id: "1d", label: "1D" },
    { id: "1w", label: "1W" },
    { id: "1m", label: "1M" },
    { id: "6m", label: "6M" },
    { id: "1y", label: "1Y" },
    { id: "refDate", label: "01/01/20" },
  ];

  return (
    <div className='container'>
      {coins && (
        <div className='heading'>
          {headCells.map((cell) => (
            <p key={cell.id}>{cell.label}</p>
          ))}
        </div>
      )}

      {coins.map((coin) => {
        return (
          <Link to={`/coin/${coin.id}`} element={<Coin />} key={coin.id}>
            <CoinItem coins={coin} />
          </Link>
        );
      })}
    </div>
  );
}

export default Prices;

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Routes, Route } from "react-router-dom";
import Coins from "./components/Coins-2";
import Coin from "./routes/Coin";
import Navbar from "./components/Navbar";

async function fetchData(url) {
  return axios
    .get(url)
    .then((res) => res.data)
    .catch((err) => console.log(err));
}

const App = () => {
  const [coins, setCoins] = useState([]);
  const totCryptos = 10;
  const url1 = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${totCryptos}&page=1&sparkline=false&price_change_percentage=1h%2C%2024h%2C%207d%2C%2030d%2C%20200d%2C%201y%2C%203y`;

  useEffect(() => {
    async function fetch() {
      fetchData(url1).then((res) => {
        setCoins(res);
      });
    }

    fetch();
  }, [url1]);

  /**
   * The following function loops through the first items of coins and returns
   * some of the properties.
   *
   * const url2 = `https://api.coingecko.com/api/v3/coins/${params.coinId}`;
   * this one needs a function to extract every params
   */
  function coinData() {
    return coins.slice(0, 10).map((coin) => {
      return (
        <>
          <div>{coin.id}</div>
          <div>{coin.symbol}</div>
        </>
      );
    });
  }

  return (
    <>
      <Navbar />
      <div>{coinData()}</div>
      <div className='grid'></div>
      <Routes>
        <Route path='/' element={<Coins coins={coins} />} />
        <Route path='/coin' element={<Coin />}>
          <Route path=':coinId' element={<Coin />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;

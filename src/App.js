import React, { useState, useEffect } from "react";
import axios from "axios";
import { Routes, Route } from "react-router-dom";
import Coins1 from "./components/Coins-1";
import Coins2 from "./components/Coins-2";
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
  const totCryptos = 3;
  const url1 = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${totCryptos}&page=1&sparkline=false&price_change_percentage=1h%2C%2024h%2C%207d%2C%2030d%2C%20200d%2C%201y%2C%203y`;
  const url3 = `https://api.coingecko.com/api/v3/coins/bitcoin/history?date=1-1-2020`;
  // url3 is supposed to fetch data for all coins at the 1 Jan 2020 date, and display the difference in %

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
   *
   * we need to loop thru url2, not url1
   */
  function coinData() {
    return coins.slice(0, totCryptos).map((coin) => {
      return (
        <>
          <div>
            {coin.symbol}: 1day: {coin.price_change_percentage_24h.toFixed(2)}%
            // 1week: {coin.price_change_percentage_7d}% // 1month:
            {coin.price_change_percentage_30d} // 7months:{" "}
            {coin.price_change_percentage_200d}
            // 1year:
            {coin.price_change_percentage_1y}
          </div>
        </>
      );
    });
  }

  return (
    <>
      <Navbar />
      <div>{coinData()}</div>
      <div className="grid"></div>
      <Routes>
        <Route path="/" element={<Coins1 coins={coins} />} />
        <Route path="/supply" element={<Coins2 coins={coins} />} />
        <Route path="/coin" element={<Coin />}>
          <Route path=":coinId" element={<Coin />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;

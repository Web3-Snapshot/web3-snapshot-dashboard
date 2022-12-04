import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Prices from "./components/Prices";
import Supply from "./components/Supply";
import Coin from "./routes/Coin";
import Navbar from "./components/Navbar";
import { PAGES } from "./constants";

// url3 is supposed to fetch data for all coins at the 1 Jan 2020 date, and display the difference in %
// const URL3 = `https://api.coingecko.com/api/v3/coins/bitcoin/history?date=1-1-2020`;

// async function fetchData(url) {
//   return axios
//     .get(url)
//     .then((res) => res.data)
//     .catch((err) => console.log(err));
// }

function App() {
  /**
   * The following function loops through the first items of coins and returns
   * some of the properties.
   *
   *
   * we need to loop thru url2, not url1
   */
  function coinData(markets) {
    return markets.slice(0, PAGES).map((coin) => {
      return (
        <>
          <div>
            {coin.symbol}: 1day: {coin.price_change_percentage_24h.toFixed(2)}%
            {/* 1week: {coin.price_change_percentage_7d}%  1month: */}
            {coin.price_change_percentage_30d} {/* 7months:{" "} */}
            {coin.price_change_percentage_200d}
            {/* 1year: */}
            {coin.price_change_percentage_1y}
          </div>
        </>
      );
    });
  }

  return (
    <>
      <Navbar />
      {/* <div>{coinData()}</div> */}
      <div className='grid'></div>
      <Routes>
        <Route path='/prices' element={<Prices />} />
        <Route path='/supply' element={<Supply />} />
        <Route path='/coin' element={<Coin />}>
          <Route path=':coinId' element={<Coin />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;

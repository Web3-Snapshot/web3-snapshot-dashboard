import React, { useState, useEffect } from "react";
import axios from "axios";
import { Routes, Route } from "react-router-dom";
import Prices from "./components/Supply";
import Coins2 from "./components/Coins-2";
import Coin from "./routes/Coin";
import Navbar from "./components/Navbar";
import { PAGES } from "./constants";

//  this one needs a function to extract every params
async function fetchCoins(id) {
  const coinUrl = `https://api.coingecko.com/api/v3/coins/${id}`;
  return axios({
    method: "GET",
    url: coinUrl,
  })
    .then((res) => {
      return res;
    })
    .catch((err) => {
      throw new Error(err);
    });
}

// url3 is supposed to fetch data for all coins at the 1 Jan 2020 date, and display the difference in %
// const URL3 = `https://api.coingecko.com/api/v3/coins/bitcoin/history?date=1-1-2020`;

// async function fetchData(url) {
//   return axios
//     .get(url)
//     .then((res) => res.data)
//     .catch((err) => console.log(err));
// }

function App() {
  const [coins, setCoins] = useState([]);

  // useEffect(() => {
  //   fetchCoins().then((res) => setCoins(res));
  // }, []);

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
        <Route path='/' element={<Prices />} />
        {/* <Route path='/supply' element={<Coins2 />} /> */}
        <Route path='/coin' element={<Coin />}>
          <Route path=':coinId' element={<Coin />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Routes, Route } from "react-router-dom";
import Coins from "./components/Coins-1";
import Coin from "./routes/Coin";
import Navbar from "./components/Navbar";

const App = () => {
  const [coins, setCoins] = useState([]);
  const totCryptos = 10;
  const url1 = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${totCryptos}&page=1&sparkline=false&price_change_percentage=1h%2C%2024h%2C%207d%2C%2030d%2C%20200d%2C%201y%2C%203y`;

  useEffect(() => {
    axios
      .get(url1)
      .then((response) => {
        setCoins(response.data);
        //console.log(response.data[0])
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  // the following function should make a loop for "totCryptos" and return all data for each coin

  function coinData() {
    // a loop through 100 coins to get their internal data
    // const url2 = `https://api.coingecko.com/api/v3/coins/${params.coinId}`; this one needs a function to extract every params
    const contCoins = totCryptos.map((item) => {
      return <contCoins key={item.id} />;
    });
    return console.log(contCoins);
  }

  // coinData();

  return (
    <>
      <Navbar />
      <div className="grid"></div>
      <Routes>
        <Route path="/" element={<Coins coins={coins} />} />
        <Route path="/coin" element={<Coin />}>
          <Route path=":coinId" element={<Coin />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;

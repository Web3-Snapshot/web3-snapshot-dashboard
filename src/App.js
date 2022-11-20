import React, { useState, useEffect } from "react";
import axios from "axios";
import { Routes, Route } from "react-router-dom";
import Coins from "./components/Coins";
import Coin from "./routes/Coin";
import Navbar from "./components/Navbar";

const URL1 =
  "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false";

// TODO: this should be the other URL from which we fetch the alternative data
const URL2 = "https://fake-url.com";

async function fetchData(url) {
  return axios
    .get(url)
    .then((res) => res.data)
    .catch((err) => console.log(err));
}

const App = () => {
  const [coins, setCoins] = useState([]);
  const [fetchUrl, setFetchUrl] = useState(URL1);

  useEffect(() => {
    async function fetch() {
      fetchData(fetchUrl).then((res) => {
        setCoins(res);
      });
    }

    fetch();
  }, [fetchUrl]);

  function handleTableUpdate(evt) {
    if (fetchUrl === URL1) {
      setFetchUrl(URL1);
      console.log(`fetching ${URL1}`);
    } else {
      // TODO: only when you change the 'fetchUrl` here, the 'useEffect`
      // will run and the new data will be fetched
      // setFetchUrl(URL2);
      console.log(`fetching ${URL2}`);
    }
  }

  return (
    <>
      <Navbar />
      <Routes>
        <Route
          path='/'
          element={<Coins clickHandler={handleTableUpdate} coins={coins} />}
        />
        <Route path='/coin' element={<Coin />}>
          <Route path=':coinId' element={<Coin />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;

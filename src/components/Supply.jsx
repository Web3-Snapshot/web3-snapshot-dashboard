import React, { useState, useEffect } from "react";
import axios from "axios";
import CoinItem from "./CoinItem-2";
import Coin from "../routes/Coin";
import { Link, useOutletContext } from "react-router-dom";

import "./Coins.css";

async function fetchCoins(id) {
  const coinUrl = `https://api.coingecko.com/api/v3/coins/${id}`;
  return axios({
    method: "GET",
    url: coinUrl,
  })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      throw new Error(err);
    });
}

function Supply() {
  const context = useOutletContext();
  // const [coins, setCoins] = useState([]);
  console.log("Rendering Supply");

  // useEffect(() => {
  //   fetchCoins().then((res) => setCoins(res));
  // }, []);

  return (
    <div className='container'>
      {context.coins && (
        <div>
          <div className='heading'>
            <p className='coin-col-1'>#</p>
            <p className='coin-col-2 coin-name'>Coin</p>
            <p className='coin-col-3'>Mkt Cap</p>
            <p className='hide-mobile'>FD Mkt Cap</p>
            <p>Supply</p>
            <p className='hide-mobile'>Supply Total</p>
            <p className='hide-mobile'>Supply Max</p>
            <p className='hide-mobile'>Volume</p>
          </div>

          {context.coins.map((coins) => {
            return (
              <Link to={`/coin/${coins.id}`} element={<Coin />} key={coins.id}>
                <CoinItem coins={coins} />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Supply;

import React, { useState, useEffect } from "react";
import CoinItem1 from "./CoinItem-1";
import Coin from "../routes/Coin";
import { Link, useOutletContext } from "react-router-dom";

import "./Coins.css";

function Prices() {
  const { coins, coinProperties } = useOutletContext();

  const headCells = [
    { id: "number", label: "#" },
    { id: "coin", label: "Coin" },
    { id: "price", label: "Price" },
    { id: "1d", label: "1 Days" },
    { id: "1w", label: "7 Days" },
    { id: "1m", label: "30 Days" },
    { id: "6m", label: "60 Days" },
    { id: "1y", label: "200 Days" },
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

      <div className='table'>
        {coins.map((coin) => (
          <Link to={`/coin/${coin.id}`} element={<Coin />} key={coin.id}>
            <CoinItem1 additionalInfo={coinProperties[coin.id]} />
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Prices;

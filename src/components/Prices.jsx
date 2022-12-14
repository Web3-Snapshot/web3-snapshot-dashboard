import React, { useState, useEffect } from "react";
import CoinItem from "./CoinItem-1";
import Coin from "../routes/Coin";
import { Link, useOutletContext } from "react-router-dom";

import "./Coins.css";

function Prices() {
  const context = useOutletContext();

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
      {context.coins && (
        <div className='heading'>
          {headCells.map((cell) => (
            <p key={cell.id}>{cell.label}</p>
          ))}
        </div>
      )}

      {context.coins.map((coin) => {
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

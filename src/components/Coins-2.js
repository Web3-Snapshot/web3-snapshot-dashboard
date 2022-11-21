import React from "react";
import CoinItem from "./CoinItem-2";
import Coin from "../routes/Coin";
import { Link } from "react-router-dom";

import "./Coins.css";

const Coins2 = (props) => {
  return (
    <div className="container">
      <div>
        <div className="heading">
          <p className="coin-col-1">#</p>
          <p className="coin-col-2 coin-name">Coin</p>
          <p className="coin-col-3">Mkt Cap</p>
          <p className="hide-mobile">FD Mkt Cap</p>
          <p>Supply</p>
          <p className="hide-mobile">Supply Total</p>
          <p className="hide-mobile">Supply Max</p>
          <p className="hide-mobile">Volume</p>
        </div>

        {props.coins.map((coins) => {
          return (
            <Link to={`/coin/${coins.id}`} element={<Coin />} key={coins.id}>
              <CoinItem coins={coins} />
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default Coins2;

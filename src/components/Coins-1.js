import React from "react";
import CoinItem from "./CoinItem-1";
import Coin from "../routes/Coin";
import { Link } from "react-router-dom";

import "./Coins.css";

const Coins1 = (props) => {
  return (
    <div className="container">
      <div>
        <div className="heading">
          <p>#</p>
          <p className="coin-name coin-col-2">Coin</p>
          <p className="coin-col-3">Price</p>
          <p className="coin-col-4">1d</p>
          <p>1w</p>
          <p>1m</p>
          <p>6m</p>
          <p>1y</p>
          <p className="hide-mobile">1/1/'20</p>
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

export default Coins1;

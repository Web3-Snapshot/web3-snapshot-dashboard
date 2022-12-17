import React from "react";
import CoinItem2 from "./CoinItem-2";
import Coin from "../routes/Coin";
import { Link, useOutletContext } from "react-router-dom";

import "./Coins.css";

function Supply() {
  const { coins, coinProperties } = useOutletContext();

  return (
    <div className='container'>
      {coins && (
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

          {coins.map((coin, idx) => {
            return (
              <Link
                to={`/coin/${coins.id}`}
                element={<Coin />}
                key={`${coins.id}-${idx}`}
              >
                <CoinItem2 additionalInfo={coinProperties[coin.id]} />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Supply;

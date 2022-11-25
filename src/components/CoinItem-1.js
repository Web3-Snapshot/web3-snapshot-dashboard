import React from "react";

const CoinItem = (props) => {
  return (
    <div className="coin-row" alt="coinRow">
      <p className="coin-col-1">{props.coins.market_cap_rank}</p>
      <div className="img-symbol coin-col-2">
        <img className="img-symbol-1" src={props.coins.image} />
        <p className="img-symbol-2">{props.coins.symbol.toUpperCase()}</p>
      </div>
      <p className="coin-col-3">
        ${props.coins.current_price.toLocaleString()}
      </p>
      <p className="coin-col-4">
        {props.coins.price_change_percentage_24h.toFixed(2)}%
      </p>
      {/* <td>{coin.market_data?.price_change_percentage_7d_in_currency ? <p>{coin.market_data.price_change_percentage_7d_in_currency.usd.toFixed(1)}%</p> : null}</td> */}
      {/* <p>{props.coins.price_change_percentage_7d.toFixed(2)}%</p> */}
      <p>-</p> {/* 7d */}
      <p>-</p> {/* 30d */}
      <p>-</p> {/* 6m */}
      <p>-</p> {/* 1y */}
      <p className="hide-mobile">-</p> {props.url3}
    </div>
  );
};

export default CoinItem;

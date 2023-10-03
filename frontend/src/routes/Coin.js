import axios from 'axios';
import { useParams } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import DOMPurify from 'dompurify';

import './Coin.module.scss';

const Coin = () => {
  const params = useParams();
  const [coin, setCoin] = useState({});

  const url = `https://api.coingecko.com/api/v3/coins/${params.coinId}`;

  useEffect(() => {
    axios
      .get(url)
      .then((res) => {
        setCoin(res.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  return (
    <div>
      <div className="coin-container">
        <div className="content">
          <h1>{coin.name}</h1>
        </div>
        <div className="content">
          <div className="rank">
            <span className="rank-btn"> Rank # {coin.market_cap_rank}</span>
          </div>
          <div className="info">
            <div className="coin-heading">
              {coin.image ? <img src={coin.image.small} /> : null}
              <p>{coin.name}</p>
              {coin.symbol ? (
                <p>
                  <br></br>
                  {coin.symbol.toUpperCase()}
                </p>
              ) : null}
            </div>
            <div className="coin-price">
              {coin.current_price ? <h1>${coin.current_price.toLocaleString()}</h1> : null}
            </div>
          </div>
        </div>
        <div className="content">
          <table>
            <thead>
              <tr>
                <th>1h</th>
                <th>24h</th>
                <th>7d</th>
                <th>30</th>
                <th>1yr</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  {coin.price_change_percentage_1h_in_currency ? (
                    <p>{coin.price_change_percentage_1h_in_currency.toFixed(1)}%</p>
                  ) : null}
                </td>
                <td>
                  {coin.price_change_percentage_24h_in_currency ? (
                    <p>{coin.price_change_percentage_24h_in_currency.toFixed(1)}%</p>
                  ) : null}
                </td>
                <td>
                  {coin.price_change_percentage_7d_in_currency ? (
                    <p>{coin.price_change_percentage_7d_in_currency.toFixed(1)}%</p>
                  ) : null}
                </td>
                <td>
                  {coin.price_change_percentage_30d_in_currency ? (
                    <p>{coin.price_change_percentage_30d_in_currency.toFixed(1)}%</p>
                  ) : null}
                </td>
                <td>
                  {coin.price_change_percentage_1y_in_currency ? (
                    <p>{coin.price_change_percentage_1y_in_currency.toFixed(1)}%</p>
                  ) : null}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="content">
          <div className="stats">
            <div className="left">
              <div className="row">
                <h4>24h low</h4>
                {coin.low_24h ? <p>${coin.low_24h.usd.toLocaleString()}</p> : null}
              </div>
              <div className="row">
                <h4>24h high</h4>
                {coin.high_24h ? <p>${coin.high_24h.usd.toLocaleString()}</p> : null}
              </div>
            </div>
            <div className="right">
              <div className="row">
                <h4>Market Cap</h4>
                {coin.market_cap ? <p>${coin.market_cap.toLocaleString()}</p> : null}
              </div>
              <div className="row">
                <h4>Circulating Supply</h4>
                <p>${coin.circulating_supply.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="content">
          <div className="about">
            <h3>About</h3>
            <p
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(coin.description ? coin.description.en : ''),
              }}></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Coin;

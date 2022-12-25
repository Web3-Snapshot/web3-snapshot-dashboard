import React from "react";
import { useOutletContext } from "react-router-dom";

import Row from "./Row";
import styles from "./Prices.module.css";
import IconAndCurrencyIdCell from "./IconAndCurrencyIdCell";

// TODO:
// This url will be used to fetch data for all coins on the 1 Jan 2020, and
// display the difference in %:
// https://api.coingecko.com/api/v3/coins/bitcoin/history?date=1-1-2020

function Prices() {
  const { coinProperties } = useOutletContext();

  const tableData = [
    {
      id: "rank",
      label: "#",
      render: (obj) => obj.market_data.market_cap_rank,
    },
    {
      id: "coin",
      label: "Coin",
      render: (obj) => <IconAndCurrencyIdCell obj={obj} />,
    },
    {
      id: "price",
      label: "Price",
      render: (obj) => obj.market_data.current_price.usd.toLocaleString(),
    },
    {
      id: "1d",
      label: "1 Day",
      render: (obj) => obj.market_data.price_change_percentage_24h.toFixed(2),
    },
    {
      id: "1w",
      label: "7 Days",
      render: (obj) => obj.market_data.price_change_percentage_7d.toFixed(2),
    },
    {
      id: "1m",
      label: "30 Days",
      render: (obj) => obj.market_data.price_change_percentage_30d.toFixed(2),
    },
    {
      id: "1y",
      label: "1 Year",
      render: (obj) => obj.market_data.price_change_percentage_1y.toFixed(2),
    },
    {
      id: "ath",
      label: "ATH",
      render: (obj) => obj.market_data.ath_change_percentage.usd.toFixed(2),
    },
  ];

  return (
    <div className={styles.container}>
      <div className={`${styles.row} ${styles.header}`}>
        <Row header tableData={tableData} />
      </div>

      {Object.entries(coinProperties).map(([id, coin]) => (
        <div key={id} className={`${styles.row} ${styles.data}`}>
          <Row tableData={tableData} row={coin} />
        </div>
      ))}
    </div>
  );
}

export default Prices;

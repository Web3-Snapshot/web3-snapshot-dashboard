import React from "react";
import { useOutletContext } from "react-router-dom";

import styles from "./Prices.module.css";
import IconAndCurrencyIdCell from "./IconAndCurrencyIdCell";
import Table from "./Table";

// TODO:
// This url will be used to fetch data for all coins on the 1 Jan 2020, and
// display the difference in %:
// https://api.coingecko.com/api/v3/coins/bitcoin/history?date=1-1-2020

function Prices() {
  const { coins } = useOutletContext();

  const tableData = [
    {
      id: "rank",
      label: "#",
      render: (obj) => obj.market_cap_rank,
    },
    {
      id: "coin",
      label: "Coin",
      render: (obj) => <IconAndCurrencyIdCell obj={obj} />,
    },
    {
      id: "price",
      label: "Price",
      render: (obj) => `$${obj.current_price.toLocaleString()}`,
    },
    {
      id: "1d",
      label: "1 Day",
      render: (obj) => `${obj.price_change_percentage_24h.toFixed(2)}%`,
    },
    {
      id: "1w",
      label: "7 Days",
      render: (obj) => `${obj.price_change_percentage_7d.toFixed(2)}%`,
    },
    {
      id: "1m",
      label: "30 Days",
      render: (obj) => `${obj.price_change_percentage_30d.toFixed(2)}%`,
    },
    {
      id: "1y",
      label: "1 Year",
      render: (obj) => `${obj.price_change_percentage_1y.toFixed(2)}%`,
    },
    {
      id: "ath",
      label: "ATH",
      render: (obj) => `${obj.ath_change_percentage.toFixed(2)}%`,
    },
  ];

  return <Table tableData={tableData} coins={coins} styles={styles} />;
}

export default Prices;

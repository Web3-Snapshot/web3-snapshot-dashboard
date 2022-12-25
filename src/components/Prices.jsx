import React from "react";
import { useOutletContext } from "react-router-dom";

import Row from "./Row";
import styles from "./Prices.module.css";
import IconAndCurrencyIdCell from "./IconAndCurrencyIdCell";

// url3 is supposed to fetch data for all coins at the 1 Jan 2020 date, and display the difference in %
// const URL3 = `https://api.coingecko.com/api/v3/coins/bitcoin/history?date=1-1-2020`;

// async function fetchData(url) {
//   return axios
//     .get(url)
//     .then((res) => res.data)
//     .catch((err) => console.log(err));
// }

function Prices() {
  const { coinProperties } = useOutletContext();

  const tableData = [
    {
      id: "number",
      label: "#",
      render: (obj) => obj.market_data.market_cap_rank,
    },
    {
      id: "coin",
      label: "Coin",
      render: (obj) => <IconAndCurrencyIdCell obj={obj} />,
    },
    {
      id: "1d",
      label: "1 Day",
      render: (obj) => obj.market_data.current_price.usd.toLocaleString(),
    },
    {
      id: "1w",
      label: "7 Days",
      render: (obj) =>
        obj.market_data.price_change_percentage_24h_in_currency.usd.toFixed(2),
    },
    {
      id: "1m",
      label: "30 Days",
      render: (obj) =>
        obj.market_data.price_change_percentage_7d_in_currency.usd.toFixed(2),
    },
    {
      id: "6m",
      label: "60 Days",
      render: (obj) =>
        obj.market_data.price_change_percentage_30d_in_currency.usd.toFixed(2),
    },
    {
      id: "1y",
      label: "200 Days",
      render: (obj) =>
        obj.market_data.price_change_percentage_60d_in_currency.usd.toFixed(2),
    },
    {
      id: "refDate",
      label: "01/01/20",
      render: (obj) =>
        obj.market_data.price_change_percentage_200d_in_currency.usd,
    },
  ];

  return (
    <div className={styles.container}>
      <div className={`${styles.row} ${styles.header}`}>
        {tableData.map((item) => (
          <span className={styles.cell} key={item.id}>
            {item.label}
          </span>
        ))}
      </div>

      {Object.entries(coinProperties).map(([id, coin]) => (
        <div className={`${styles.row} ${styles.data}`}>
          <Row key={id} tableData={tableData} row={coin} />
        </div>
      ))}
    </div>
  );
}

export default Prices;

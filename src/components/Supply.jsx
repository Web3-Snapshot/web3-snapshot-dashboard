import React from "react";
import Row from "./Row";
import { useOutletContext } from "react-router-dom";
import IconAndCurrencyIdCell from "./IconAndCurrencyIdCell";

import styles from "./Supply.module.css";

function Supply() {
  const { coinProperties } = useOutletContext();

  const tableData = [
    {
      id: "marketCapRank",
      label: "#",
      render: (obj) => obj.market_data.market_cap_rank,
    },
    {
      id: "icon",
      label: "Coin",
      render: (obj) => <IconAndCurrencyIdCell obj={obj} />,
    },
    {
      id: "marketCapUSD",
      label: "Market Cap",
      render: (obj) => `$${obj.market_data.market_cap.usd.toLocaleString()}`,
    },
    {
      id: "FDMarketCap",
      label: "FD Market Cap",
      render: (obj) => `$${obj.market_data.market_cap.usd.toLocaleString()}`,
    },
    {
      id: "totalSupply",
      label: "Total Supply",
      render: (obj) => obj.market_data.total_supply,
    },
    {
      id: "maxSupply",
      label: "Max Supply",
      render: (obj) => obj.market_data.max_supply,
    },
    {
      id: "totalVolumeUSD",
      label: "Total Volume",
      render: (obj) => obj.market_data.total_volume.usd.toLocaleString(),
    },
  ];

  return (
    <div className={styles.container}>
      <div className={`${styles.row} ${styles.header}`}>
        {tableData.map((item) => (
          <span key={item.id} className={styles.cell}>
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

export default Supply;

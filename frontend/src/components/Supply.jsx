import React from "react";
import { useOutletContext } from "react-router-dom";
import IconAndCurrencyIdCell from "./IconAndCurrencyIdCell";
import { formatLongNumbers } from "../util/helpers";
import styles from "./Supply.module.css";

import Table from "./Table";

function Supply() {
  const { coins } = useOutletContext();

  const tableData = [
    {
      id: "marketCapRank",
      label: "#",
      render: (obj) => obj.market_cap_rank,
    },
    {
      id: "icon",
      label: "Coin",
      render: (obj) => <IconAndCurrencyIdCell obj={obj} />,
    },
    {
      id: "marketCapUSD",
      label: "Market Cap",
      render: (obj) => `$${formatLongNumbers(obj.market_cap_usd)}`,
    },
    {
      id: "FDMarketCap",
      label: "FD Market Cap",
      render: (obj) => `$${formatLongNumbers(obj.fully_diluted_valuation_usd)}`,
    },
    {
      id: "circulatingSupply",
      label: "Circ. Supply",
      render: (obj) => formatLongNumbers(obj.circulating_supply),
    },
    {
      id: "totalSupply",
      label: "Total Supply",
      render: (obj) => formatLongNumbers(obj.total_supply),
    },
    {
      id: "maxSupply",
      label: "Max Supply",
      render: (obj) => formatLongNumbers(Math.round(obj.max_supply)),
    },
  ];

  return <Table tableData={tableData} coins={coins} styles={styles} />;
}

export default Supply;

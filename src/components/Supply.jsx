import React from "react";
import { useOutletContext } from "react-router-dom";
import IconAndCurrencyIdCell from "./IconAndCurrencyIdCell";
import { formatLongNumbers } from "../util/helpers";
import styles from "./Supply.module.css";

import Table from "./Table";

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
      render: (obj) => `$${formatLongNumbers(obj.market_data.market_cap.usd)}`,
    },
    {
      id: "FDMarketCap",
      label: "FD Market Cap",
      render: (obj) =>
        `$${formatLongNumbers(obj.market_data.fully_diluted_valuation.usd)}`,
    },
    {
      id: "circulatingSupply",
      label: "Circ. Supply",
      render: (obj) => formatLongNumbers(obj.market_data.circulating_supply),
    },
    {
      id: "totalSupply",
      label: "Total Supply",
      render: (obj) => formatLongNumbers(obj.market_data.total_supply),
    },
    {
      id: "maxSupply",
      label: "Max Supply",
      render: (obj) =>
        formatLongNumbers(Math.round(obj.market_data.max_supply)),
    },
  ];

  return <Table tableData={tableData} coinProperties={coinProperties} />;
}

export default Supply;

import React from 'react';
import { useOutletContext } from 'react-router-dom';

import styles from './Prices.module.css';
import IconAndCurrencyIdCell from './IconAndCurrencyIdCell';
import Table from './Table';

// TODO:
// This url will be used to fetch data for all coins on the 1 Jan 2020, and
// display the difference in %:
// https://api.coingecko.com/api/v3/coins/bitcoin/history?date=1-1-2020

function Prices() {
  const { coins } = useOutletContext();

  const tableData = [
    {
      id: 'market_cap_rank',
      label: '#',
      render: (obj) => obj.market_cap_rank,
    },
    {
      id: 'symbol',
      label: 'Coin',
      render: (obj) => <IconAndCurrencyIdCell obj={obj} />,
    },
    {
      id: 'current_price',
      label: 'Price',
      render: (obj) => `$${obj.current_price.toLocaleString()}`,
    },
    {
      id: 'price_change_percentage_24h',
      label: '1 Day',
      render: (obj) => `${obj.price_change_percentage_24h.toFixed(2)}%`,
    },
    {
      id: 'price_change_percentage_7d',
      label: '7 Days',
      render: (obj) => `${obj.price_change_percentage_7d.toFixed(2)}%`,
    },
    {
      id: 'price_change_percentage_30d',
      label: '30 Days',
      render: (obj) => `${obj.price_change_percentage_30d.toFixed(2)}%`,
    },
    {
      id: 'price_change_percentage_1y',
      label: '1 Year',
      render: (obj) => `${obj.price_change_percentage_1y.toFixed(2)}%`,
    },
    {
      id: 'ath_change_percentage',
      label: 'ATH',
      render: (obj) => `${obj.ath_change_percentage.toFixed(2)}%`,
    },
  ];

  return (
    <Table tableData={tableData} coins={coins} styles={styles} defaultOrderBy={'market_cap_rank'} />
  );
}

export default Prices;

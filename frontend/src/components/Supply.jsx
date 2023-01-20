import React from 'react';
import { useOutletContext } from 'react-router-dom';
import IconAndCurrencyIdCell from './IconAndCurrencyIdCell';
import { formatLongNumbers } from '../util/helpers';
import styles from './Supply.module.css';

import Table from './Table';

function Supply() {
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
      id: 'market_cap_usd',
      label: 'Market Cap',
      render: (obj) => `$${formatLongNumbers(obj.market_cap_usd)}`,
    },
    {
      id: 'fully_diluted_valuation_usd',
      label: 'FD Market Cap',
      render: (obj) =>
        `${obj.fully_diluted_valuation_usd ? '$' : ''}${formatLongNumbers(
          obj.fully_diluted_valuation_usd
        )}`,
    },
    {
      id: 'circulating_supply',
      label: 'Circ. Supply',
      render: (obj) => formatLongNumbers(obj.circulating_supply),
    },
    {
      id: 'total_supply',
      label: 'Total Supply',
      render: (obj) => formatLongNumbers(obj.total_supply),
    },
    {
      id: 'max_supply',
      label: 'Max Supply',
      render: (obj) => formatLongNumbers(Math.round(obj.max_supply)),
    },
  ];

  return <Table tableData={tableData} coins={coins} styles={styles} />;
}

export default Supply;

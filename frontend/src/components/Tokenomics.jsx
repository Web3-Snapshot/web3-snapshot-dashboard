import React from 'react';
import { useOutletContext } from 'react-router-dom';
import IconAndCurrencyIdCell from './IconAndCurrencyIdCell';
import { formatLongNumbers } from '../util/helpers';
import styles from './Tokenomics.module.scss';
import Table from './Table';
import { useBreakpoints } from 'react-breakpoints-hook';
import { BREAKPOINTS } from '../constants';

function Tokenomics() {
  let { ss, xs } = useBreakpoints(BREAKPOINTS);
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
      label: ss ? 'M. Cap' : 'Market Cap',
      render: (obj) => `$${formatLongNumbers(obj.market_cap_usd)}`,
    },
    {
      id: 'fully_diluted_valuation_usd',
      label: 'Fully Diluted',
      render: (obj) =>
        `${obj.fully_diluted_valuation_usd ? '$' : ''}${formatLongNumbers(
          obj.fully_diluted_valuation_usd
        )}`,
    },
    {
      id: 'market_cap_fully_diluted_valuation_usd_ratio',
      label: ' MC/ FDV',
      render: (obj) => obj.mc_fdv_ratio || '-',
    },
    {
      id: 'circulating_supply',
      label: xs || ss ? 'Circ.' : 'Circulating',
      render: (obj) => formatLongNumbers(obj.circulating_supply),
    },
    {
      id: 'total_supply',
      label: 'Total',
      render: (obj) => formatLongNumbers(obj.total_supply),
    },
    {
      id: 'max_supply',
      label: 'Max',
      render: (obj) => formatLongNumbers(Math.round(obj.max_supply)),
    },
    {
      id: 'circ_total_ratio',
      label: 'Circ./ Tot.',
      render: (obj) => obj.circ_supply_total_supply_ratio || '-',
    },
    {
      id: 'volume_24h',
      label: '24h Vol.',
      render: (obj) => formatLongNumbers(obj.total_volume),
    },
  ];

  return (
    <Table
      numberOfDynamicRows={4}
      tableData={tableData}
      coins={coins}
      rowStyles={styles}
      defaultOrderBy={['market_cap_rank']}
    />
  );
}

export default Tokenomics;

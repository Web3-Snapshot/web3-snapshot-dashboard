import React from 'react';
import { useOutletContext } from 'react-router-dom';
import IconAndCurrencyIdCell from './IconAndCurrencyIdCell';
import { formatLongNumbers } from '../util/helpers';
import { renderCellOverlay } from './CellOverlay';
import Table from './Table';
import styles from './Supply.module.scss';

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
      label: 'Mkt. Cap',
      render: (obj) => `$${formatLongNumbers(obj.market_cap_usd)}`,
      renderOverlay: (obj) => renderCellOverlay(obj.market_cap_usd_relative, obj.market_cap_usd),
    },
    {
      id: 'fully_diluted_valuation_usd',
      label: 'FD Mkt. Cap',
      render: (obj) =>
        `${obj.fully_diluted_valuation_usd ? '$' : ''}${formatLongNumbers(
          obj.fully_diluted_valuation_usd
        )}`,
      renderOverlay: (obj) =>
        renderCellOverlay(
          obj.fully_diluted_valuation_usd_relative,
          obj.fully_diluted_valuation_usd
        ),
    },
    {
      id: 'circulating_supply',
      label: 'Circ. Supply',
      render: (obj) => formatLongNumbers(obj.circulating_supply),
      renderOverlay: (obj) =>
        renderCellOverlay(obj.circulating_supply_relative, obj.circulating_supply),
    },
    {
      id: 'total_supply',
      label: 'Total Supply',
      render: (obj) => formatLongNumbers(obj.total_supply),
      renderOverlay: (obj) => renderCellOverlay(obj.total_supply_relative, obj.total_supply),
    },
    {
      id: 'max_supply',
      label: 'Max Supply',
      render: (obj) => formatLongNumbers(Math.round(obj.max_supply)),
      renderOverlay: (obj) => renderCellOverlay(obj.max_supply_relative, obj.max_supply),
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

export default Supply;

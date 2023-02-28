import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { createPortal } from 'react-dom';

import styles from './Prices.module.scss';
import IconAndCurrencyIdCell from './IconAndCurrencyIdCell';
import Table from './Table';
import { renderCell, renderCellOverlay } from './CellOverlay';
import CoinInfoModal from './CoinInfoModal';

const COIN_INFO_PROPS = [
  'id',
  'name',
  'symbol',
  'image_thumb',
  'categories',
  'genesis_date',
  'total_value_locked',
  'homepage',
  'blockchain_site',
  'hashing_algorithm',
  'coingecko_score',
  'developer_score',
  'community_score',
  'liquidity_score',
  'public_interest_score',
  'description',
];

// TODO:
// This url will be used to fetch data for all coins on the 1 Jan 2020, and
// display the difference in %:
// https://api.coingecko.com/api/v3/coins/bitcoin/history?date=1-1-2020

function Prices() {
  const { coins } = useOutletContext();
  const [isCoinInfoModalOpen, setIsCoinInfoModalOpen] = useState(false);
  const [row, setRow] = useState();

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
      renderOverlay: (obj) => renderCellOverlay(obj.current_price_relative, obj.current_price),
    },
    {
      id: 'price_change_percentage_24h',
      label: '1 Day',
      render: (obj) => renderCell(obj.price_change_percentage_24h, (val) => `${val.toFixed(2)}%`),
      renderOverlay: (obj) =>
        renderCellOverlay(
          obj.price_change_percentage_24h_relative,
          obj.price_change_percentage_24h
        ),
    },
    {
      id: 'price_change_percentage_7d',
      label: '7 Days',
      render: (obj) => renderCell(obj.price_change_percentage_7d, (val) => `${val.toFixed(2)}%`),
      renderOverlay: (obj) =>
        renderCellOverlay(obj.price_change_percentage_7d_relative, obj.price_change_percentage_7d),
    },
    {
      id: 'price_change_percentage_30d',
      label: '30 Days',
      render: (obj) => renderCell(obj.price_change_percentage_30d, (val) => `${val.toFixed(2)}%`),
      renderOverlay: (obj) =>
        renderCellOverlay(
          obj.price_change_percentage_30d_relative,
          obj.price_change_percentage_30d
        ),
    },
    {
      id: 'price_change_percentage_1y',
      label: '1 Year',
      render: (obj) => renderCell(obj.price_change_percentage_1y, (val) => `${val.toFixed(2)}%`),
      renderOverlay: (obj) =>
        renderCellOverlay(obj.price_change_percentage_1y_relative, obj.price_change_percentage_1y),
    },
    {
      id: 'ath_change_percentage',
      label: 'ATH',
      render: (obj) => renderCell(obj.ath_change_percentage, (val) => `${val.toFixed(2)}%`),
      renderOverlay: (obj) =>
        renderCellOverlay(obj.ath_change_percentage_relative, obj.ath_change_percentage),
    },
  ];

  function handleRowClick(evt, row, cell) {
    setRow(row);
    setIsCoinInfoModalOpen(true);
  }

  function filterCoinInfoProps(obj) {
    return Object.fromEntries(Object.entries(obj).filter(([key]) => COIN_INFO_PROPS.includes(key)));
  }

  return (
    <>
      {isCoinInfoModalOpen &&
        createPortal(
          <CoinInfoModal
            isOpen={isCoinInfoModalOpen}
            onClose={() => setIsCoinInfoModalOpen(false)}
            row={filterCoinInfoProps(row)}
          />,
          document.body
        )}
      <Table
        tableData={tableData}
        coins={coins}
        rowStyles={styles}
        defaultOrderBy={['market_cap_rank']}
        onRowClick={handleRowClick}
      />
    </>
  );
}

export default Prices;

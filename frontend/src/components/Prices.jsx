import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { createPortal } from 'react-dom';

import styles from './Prices.module.scss';
import IconAndCurrencyIdCell from './IconAndCurrencyIdCell';
import Table from './Table';
import { renderCell, renderCellOverlay } from './CellOverlay';

// TODO:
// This url will be used to fetch data for all coins on the 1 Jan 2020, and
// display the difference in %:
// https://api.coingecko.com/api/v3/coins/bitcoin/history?date=1-1-2020

function CoinInfo({ onClose, row }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className={styles.coinInfo} onClick={() => console.log('Clicked on coinInfo')}>
      <div
        className={styles.backdrop}
        onClick={(evt) => {
          evt.stopPropagation();
          onClose();
        }}>
        <div
          className={styles.dialogRoot}
          onClick={(evt) => {
            evt.stopPropagation();
          }}>
          {Object.values(row).map((item, idx) => {
            return <p key={`${row.id}-${idx}`}>{item}</p>;
          })}
        </div>
      </div>
    </div>
  );
}

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
    console.log('cell ', cell);
    console.log('row', row);
    setRow(row);
    setIsCoinInfoModalOpen(true);
  }

  return (
    <>
      {isCoinInfoModalOpen &&
        createPortal(
          <CoinInfo
            isOpen={isCoinInfoModalOpen}
            onClose={() => setIsCoinInfoModalOpen(false)}
            row={row}
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

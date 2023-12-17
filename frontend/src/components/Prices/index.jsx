import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { isEmpty } from 'lodash';

import { usePricesStore } from './state';
import { fetchCoins } from '../../shared/api';
import IconAndCurrencyIdCell from '../IconAndCurrencyIdCell';
import Table from '../Table';
import { renderCell, renderCellOverlay } from '../CellOverlay';
import CoinInfoModal from '../CoinInfoModal';
import { useScrollLock } from '../../custom-hooks/useScrollLock';

import styles from './Prices.module.scss';

const selectRows = (state) => state.rows;

function Prices() {
  const { lockScroll, unlockScroll } = useScrollLock();
  const [isCoinInfoModalOpen, setIsCoinInfoModalOpen] = useState(false);
  const [row, setRow] = useState();
  const defaultOrderByProp = ['market_cap_rank'];
  const setRows = usePricesStore((state) => state.setRows);
  const setUpdatedAt = usePricesStore((state) => state.setUpdatedAt);
  const coins = usePricesStore(selectRows);

  const initalDataFetchDone = useRef(false);

  useEffect(() => {
    const fetchData = async function () {
      fetchCoins().then((res) => {
        console.log(res.updatedAt);
        setRows(res.payload);
        setUpdatedAt(res.updated_at);
      });
    };

    fetchData();
    initalDataFetchDone.current = true;
  }, []);

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
      render: (obj) => `$${obj.current_price?.toLocaleString()}`,
      derOverlay: (obj) => renderCellOverlay(obj.current_price_relative, obj.current_price),
    },
    {
      id: 'price_change_percentage_24h_in_currency',
      label: '1 Day',
      render: (obj) =>
        renderCell(obj.price_change_percentage_24h_in_currency, (val) => `${val?.toFixed(2)}%`),
      renderOverlay: (obj) =>
        renderCellOverlay(
          obj.price_change_percentage_24h_in_currency_relative,
          obj.price_change_percentage_24h_in_currency
        ),
    },
    {
      id: 'price_change_percentage_7d_in_currency',
      label: '7 Days',
      render: (obj) =>
        renderCell(obj.price_change_percentage_7d_in_currency, (val) => `${val?.toFixed(2)}%`),
      renderOverlay: (obj) =>
        renderCellOverlay(
          obj.price_change_percentage_7d_in_currency_relative,
          obj.price_change_percentage_7d_in_currency
        ),
    },
    {
      id: 'price_change_percentage_30d_in_currency',
      label: '30 Days',
      render: (obj) =>
        renderCell(obj.price_change_percentage_30d_in_currency, (val) => `${val?.toFixed(2)}%`),
      renderOverlay: (obj) =>
        renderCellOverlay(
          obj.price_change_percentage_30d_in_currency_relative,
          obj.price_change_percentage_30d_in_currency
        ),
    },
    {
      id: 'price_change_percentage_1y_in_currency',
      label: '1 Year',
      render: (obj) =>
        renderCell(obj.price_change_percentage_1y_in_currency, (val) => `${val?.toFixed(2)}%`),
      renderOverlay: (obj) =>
        renderCellOverlay(
          obj.price_change_percentage_1y_in_currency_relative,
          obj.price_change_percentage_1y_in_currency
        ),
    },
    {
      id: 'ath_change_percentage',
      label: 'ATH',
      render: (obj) => renderCell(obj.ath_change_percentage, (val) => `${val?.toFixed(2)}%`),
      renderOverlay: (obj) =>
        renderCellOverlay(obj.ath_change_percentage_relative, obj.ath_change_percentage),
    },
  ];

  const handleRowClick = useCallback(
    (_, row) => {
      // setRow(row);
      // lockScroll();
      // setIsCoinInfoModalOpen(true);
    },
    [lockScroll]
  );

  const handleClose = useCallback(() => {
    unlockScroll();
    setIsCoinInfoModalOpen(false);
  }, [unlockScroll]);

  return (
    <>
      {isCoinInfoModalOpen &&
        createPortal(
          <CoinInfoModal isOpen={isCoinInfoModalOpen} onClose={handleClose} row={row} />,
          document.body
        )}
      <>
        {!isEmpty(coins) && (
          <Table
            tableData={tableData}
            coins={coins}
            onRowClick={handleRowClick}
            rowStyles={styles}
            defaultOrderBy={defaultOrderByProp}
          />
        )}
      </>
    </>
  );
}

export default Prices;

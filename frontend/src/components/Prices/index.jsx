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

const selectRows = (state) => state.rows;

function Prices() {
  const { lockScroll, unlockScroll } = useScrollLock();
  const [isCoinInfoModalOpen, setIsCoinInfoModalOpen] = useState(false);
  const coinId = useRef(null);
  const defaultOrderByProp = ['market_cap_rank'];
  const setRows = usePricesStore((state) => state.setRows);
  const setOrder = usePricesStore((state) => state.setOrder);
  const setUpdatedAt = usePricesStore((state) => state.setUpdatedAt);
  const coins = usePricesStore(selectRows);

  useEffect(() => {
    const fetchData = async function () {
      fetchCoins().then((res) => {
        console.log(res.prices);
        setRows(res.prices);
        setOrder(res.order);

        setUpdatedAt(res.updated_at);
      });
    };

    fetchData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
      coinId.current = row.id;
      lockScroll();
      setIsCoinInfoModalOpen(true);
    },
    [lockScroll]
  );

  const handleClose = useCallback(() => {
    coinId.current = null;
    unlockScroll();
    setIsCoinInfoModalOpen(false);
  }, [unlockScroll]);

  return (
    <>
      {isCoinInfoModalOpen &&
        createPortal(
          <CoinInfoModal
            coinId={coinId.current}
            isOpen={isCoinInfoModalOpen}
            onClose={handleClose}
          />,
          document.body
        )}
      <>
        {!isEmpty(coins) && (
          <Table
            pageId="prices"
            tableData={tableData}
            coins={coins}
            onRowClick={handleRowClick}
            defaultOrderBy={defaultOrderByProp}
          />
        )}
      </>
    </>
  );
}

export default Prices;

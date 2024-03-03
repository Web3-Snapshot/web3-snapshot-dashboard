import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { isEmpty } from 'lodash';

import { useTokenomicsStore } from './state';
import { fetchCoins } from '../../shared/api';
import IconAndCurrencyIdCell from '../IconAndCurrencyIdCell';
import Table from '../Table';
import { useBreakpoints } from 'react-breakpoints-hook';
import CoinInfoModal from '../CoinInfoModal';
import { formatLongNumbers } from '../../utils/helper_functions';
import { useScrollLock } from '../../custom-hooks/useScrollLock';
import { BREAKPOINTS } from '../../constants';

const selectRows = (state) => state.rows;
const selectOrderedIds = (state) => state.orderedIds;

function Tokenomics() {
  let { ss, mobile, tablet } = useBreakpoints(BREAKPOINTS);
  const { lockScroll, unlockScroll } = useScrollLock();
  const [isCoinInfoModalOpen, setIsCoinInfoModalOpen] = useState(false);
  const defaultOrderByProp = ['market_cap_rank'];
  const setRows = useTokenomicsStore((state) => state.setRows);
  const setOrderedIds = useTokenomicsStore((state) => state.setOrderedIds);
  const setUpdatedAt = useTokenomicsStore((state) => state.setUpdatedAt);
  const coins = useTokenomicsStore(selectRows);
  const orderedIds = useTokenomicsStore(selectOrderedIds);

  useEffect(() => {
    function fetchData() {
      fetchCoins().then((res) => {
        setRows(res.tokenomics);
        setOrderedIds(res.order);
        setUpdatedAt(res.updated_at);
      });
    }

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
      id: 'market_cap',
      label: ss ? 'M. Cap' : 'Market Cap',
      render: (obj) => `$${formatLongNumbers(obj.market_cap)}`,
    },
    {
      id: 'fully_diluted_valuation',
      label: mobile || tablet ? 'FD' : 'Fully Diluted',
      render: (obj) =>
        `${obj.fully_diluted_valuation ? '$' : ''}${formatLongNumbers(
          obj.fully_diluted_valuation
        )}`,
    },
    {
      id: 'mc_fdv_ratio',
      label: ' MC/FDV',
      render: (obj) => obj.mc_fdv_ratio || '-',
    },
    {
      id: 'circulating_supply',
      // TODO: Create a hook for this
      label: (function () {
        if (mobile) {
          return 'Circ.';
        } else if (tablet) {
          return 'Circulating';
        } else {
          return 'Circulating Supply';
        }
      })(),
      render: (obj) => formatLongNumbers(obj.circulating_supply),
    },
    {
      id: 'total_supply',
      label: mobile || tablet ? 'Total' : 'Total Supply',
      render: (obj) => formatLongNumbers(obj.total_supply),
    },
    {
      id: 'max_supply',
      label: mobile || tablet ? 'Max' : 'Max Supply',
      render: (obj) => formatLongNumbers(Math.round(obj.max_supply)),
    },
    {
      id: 'circ_supply_total_supply_ratio',
      label: mobile || tablet ? 'Circ/Tot' : 'Circ./ Tot.',
      render: (obj) => obj.circ_supply_total_supply_ratio || '-',
    },
    {
      id: 'total_volume',
      label: mobile || tablet ? '24h' : '24h Vol.',
      render: (obj) => formatLongNumbers(obj.total_volume),
    },
  ];

  function handleRowClick(_, row) {
    lockScroll();
    setIsCoinInfoModalOpen(true);
  }

  function handleClose() {
    unlockScroll();
    setIsCoinInfoModalOpen(false);
  }

  return (
    <>
      {isCoinInfoModalOpen &&
        createPortal(
          <CoinInfoModal isOpen={isCoinInfoModalOpen} onClose={handleClose} />,
          document.body
        )}
      <>
        {!isEmpty(coins) && (
          <Table
            pageId="tokenomics"
            orderedIds={orderedIds}
            setOrderedIds={setOrderedIds}
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

export default Tokenomics;

import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { createPortal } from 'react-dom';

import CoinInfoModal from './CoinInfoModal';
import IconAndCurrencyIdCell from './IconAndCurrencyIdCell';
import { formatLongNumbers } from '../util/helpers';
import styles from './Tokenomics.module.scss';
import Table from './Table';
import { useBreakpoints } from 'react-breakpoints-hook';
import { useScrollLock } from '../custom-hooks/useScrollLock';
import { BREAKPOINTS } from '../constants';

function Tokenomics() {
  const { lockScroll, unlockScroll } = useScrollLock();
  let { ss, mobile, tablet } = useBreakpoints(BREAKPOINTS);
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
      id: 'market_cap_usd',
      label: ss ? 'M. Cap' : 'Market Cap',
      render: (obj) => `$${formatLongNumbers(obj.market_cap_usd)}`,
    },
    {
      id: 'fully_diluted_valuation_usd',
      label: mobile || tablet ? 'FD' : 'Fully Diluted',
      render: (obj) =>
        `${obj.fully_diluted_valuation_usd ? '$' : ''}${formatLongNumbers(
          obj.fully_diluted_valuation_usd
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
    setRow(row);
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
          <CoinInfoModal isOpen={isCoinInfoModalOpen} onClose={handleClose} row={row} />,
          document.body
        )}
      <Table
        numberOfDynamicRows={4}
        tableData={tableData}
        coins={coins}
        onRowClick={handleRowClick}
        rowStyles={styles}
        defaultOrderBy={['market_cap_rank']}
      />
    </>
  );
}

export default Tokenomics;

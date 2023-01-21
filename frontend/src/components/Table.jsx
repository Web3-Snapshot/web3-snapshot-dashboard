import React, { useState, useEffect } from 'react';
import tableStyles from './Table.module.css';
import Row from './Row';
import HeaderRow from './HeaderRow';
import { useBreakpoints } from 'react-breakpoints-hook';
import { BREAKPOINTS } from '../constants';

const CARD_HEADER_FIELDS = ['market_cap_rank', 'symbol', 'market_cap_usd'];

function comparison(a, b) {
  if (a > b) return -1;
  if (b > a) return 1;
  return 0;
}

export function comparator(a, b, order, orderBy) {
  const multiplier = order === 'desc' ? 1 : -1;
  return orderBy.reduce((acc, curr) => {
    acc ||= comparison(a[curr], b[curr]);
    return multiplier * acc;
  }, false);
}

export function objectSort(obj, order, orderBy) {
  const dataObj = obj.data;
  return Object.entries(dataObj)
    .sort(([_, av], [__, bv]) => comparator(av, bv, order, orderBy))
    .reduce((acc, [currk, _]) => [...acc, currk], []);
}

function Table({ tableData, coins, styles, defaultOrderBy }) {
  const [orderedCoins, setOrderedCoins] = useState(coins.order);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState(defaultOrderBy);

  let { xs, sm, lg, xl } = useBreakpoints(BREAKPOINTS);

  function handleSort(_, cellId, order) {
    setOrder(order);
    setOrderBy([cellId]);
  }

  useEffect(() => {
    if (coins.order.length > 0) {
      setOrderedCoins(objectSort(coins, order, orderBy));
    }
  }, [order, orderBy, coins]);

  return (
    <div className={tableStyles.container}>
      {xl || lg ? (
        <>
          <div className={`${styles.row} ${styles.header}`}>
            <HeaderRow
              headers={tableData}
              styles={styles}
              tableStyles={tableStyles}
              sortHandler={handleSort}
              order={order}
              orderBy={orderBy}
            />
          </div>
          {orderedCoins.map((coinGuid) => (
            <div key={coinGuid} className={`${styles.row} ${styles.data}`}>
              <Row tableData={tableData} row={coins.data[coinGuid]} styles={styles} />
            </div>
          ))}
        </>
      ) : (
        <>
          {orderedCoins.map((coinGuid) => (
            <div key={coinGuid} className={tableStyles.cardContainer}>
              <div className={tableStyles.cardHeader}>
                {tableData
                  .filter((item) => CARD_HEADER_FIELDS.includes(item.id))
                  .map((item) => (
                    <div key={item.id} className={tableStyles.topSection}>
                      <span className={tableStyles.cardLabels}>
                        {item.render(coins.data[coinGuid])}
                      </span>
                    </div>
                  ))}
              </div>
              <div className={tableStyles.cardBody}>
                {tableData
                  .filter((item) => !CARD_HEADER_FIELDS.includes(item.id))
                  .map((item) => (
                    <div key={item.id} className={tableStyles.bottomItem}>
                      <span className={tableStyles.cardItemLabel}>{item.label}</span>
                      <span>{item.render(coins.data[coinGuid])}</span>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
export default Table;

import React, { useState, useEffect } from 'react';
import tableStyles from './Table.module.css';
import Row from './Row';
import HeaderRow from './HeaderRow';
import { useBreakpoints } from 'react-breakpoints-hook';

// let { xs, sm, md, lg } = useBreakpoints({
//   xs: { min: 0, max: 360 },
//   sm: { min: 361, max: 960 },
//   md: { min: 961, max: 1400 },
//   lg: { min: 1401, max: null },
// });

const BREAKPOINTS = {
  xs: { min: 0, max: 599 },
  sm: { min: 600, max: 1159 },
  // md: { min: 961, max: 1400 },
  lg: { min: 1160, max: 1559 },
  xl: { min: 1560, max: null },
};

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
        <h1>Here we will see the Card View later</h1>
      )}
    </div>
  );
}
export default Table;

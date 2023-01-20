import React, { useState, useEffect } from 'react';
import tableStyles from './Table.module.css';
import Row from './Row';
import HeaderRow from './HeaderRow';

export function comparator(a, b, order, orderBy) {
  const multiplier = order === 'asc' ? 1 : -1;
  return orderBy.reduce((acc, curr) => {
    acc ||= a[curr] - b[curr];
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
    </div>
  );
}
export default Table;

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { isEmpty } from 'lodash';
import styles from './Table.module.scss';
import Row from './Row';
import HeaderRow from './HeaderRow';
import Card from './Card';
import { useBreakpoints } from 'react-breakpoints-hook';
import { BREAKPOINTS } from '../constants';
import { objectSort } from '../utils/helpers';
import { usePricesStore } from './Prices/state';

function Table({ tableData, coins, rowStyles, defaultOrderBy, onRowClick }) {
  // const [orderedIds, setOrderedIds] = useState(coins.order);
  const orderedIds = usePricesStore((state) => state.order);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState(defaultOrderBy);
  let { desktop } = useBreakpoints(BREAKPOINTS);
  const labelsAndIds = tableData.map((item) => ({ label: item.label, id: item.id }));

  const handleSort = useCallback(
    (_, cellId) => {
      setOrder(order === 'asc' ? 'desc' : 'asc');
      setOrderBy([cellId]);
    },
    [order]
  );

  const renderHeaderRow = useCallback((labelsAndIds, styles, handleSort, order, orderBy) => {
    return (
      <HeaderRow
        headers={labelsAndIds}
        styles={styles}
        sortHandler={handleSort}
        order={order}
        orderBy={orderBy}
      />
    );
  }, []);

  // const memoizedHeaderRow = useMemo(
  //   () => renderHeaderRow(labelsAndIds, styles, handleSort, order, orderBy),
  //   [labelsAndIds, order, orderBy]
  // );

  useEffect(() => {
    // if (coins.order.length > 0) {
    if (orderedIds.length > 0) {
      // setOrderedIds(objectSort(coins, order, orderBy));
    }
  }, [coins, order, orderBy]);

  return (
    <div className={styles.container}>
      {desktop ? (
        <>
          {/* <div className={`${rowStyles.row} ${styles.header}`}>{memoizedHeaderRow}</div> */}
          {orderedIds.map((coinId) => (
            <div key={coinId} className={`${rowStyles.row} ${styles.data}`}>
              <Row
                tableData={tableData}
                row={coins[coinId]}
                styles={styles}
                onRowClick={onRowClick}
              />
            </div>
          ))}
        </>
      ) : (
        <>
          {/* <div className={`${rowStyles.row} ${styles.header}`}>{memoizedHeaderRow}</div> */}
          <div className={`${rowStyles.row} ${styles.header}`}>
            <HeaderRow
              headers={labelsAndIds}
              styles={styles}
              sortHandler={handleSort}
              order={order}
              orderBy={orderBy}
            />
          </div>
          {orderedIds.map((coinId) => (
            <Card
              key={coinId}
              tableData={tableData}
              coin={coins.data[coinId]}
              onCardClick={onRowClick}
            />
          ))}
        </>
      )}
    </div>
  );
}
export default Table;

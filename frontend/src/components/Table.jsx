import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { isEmpty } from 'lodash';
import styles from './Table.module.scss';
import Row from './Row';
import HeaderRow from './HeaderRow';
import { useBreakpoints } from 'react-breakpoints-hook';
import { objectSort } from '../utils/helpers';

function Table({ tableData, coins, rowStyles, defaultOrderBy, onRowClick }) {
  const [orderedCoins, setOrderedCoins] = useState(coins.order);
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

  const memoizedHeaderRow = useMemo(
    () => renderHeaderRow(labelsAndIds, styles, handleSort, order, orderBy),
    [labelsAndIds, order, orderBy]
  );

  useEffect(() => {
    if (coins.order.length > 0) {
      setOrderedCoins(objectSort(coins, order, orderBy));
    }
  }, [coins, order, orderBy]);

  return (
    <div className={styles.container}>
      {desktop ? (
        <>
          <div className={`${rowStyles.row} ${styles.header}`}>{memoizedHeaderRow}</div>
          {orderedCoins.map((coinId) => (
            <div key={coinId} className={`${rowStyles.row} ${styles.data}`}>
              {!isEmpty(coins.data[coinId]) && (
                <Row
                  tableData={tableData}
                  row={coins.data[coinId]}
                  styles={styles}
                  onRowClick={onRowClick}
                />
              )}
            </div>
          ))}
        </>
      ) : (
        <>
          {orderedCoins.map((coinId) => {
            const coin = coins.data[coinId];
            return (
              coin && (
                <Card key={coinId} tableData={tableData} coin={coin} onCardClick={onRowClick} />
              )
            );
          })}
        </>
      )}
    </div>
  );
}
export default Table;

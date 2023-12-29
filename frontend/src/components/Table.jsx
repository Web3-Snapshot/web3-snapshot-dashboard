import React, { useState, useEffect, useCallback } from 'react';
import styles from './Table.module.scss';
import Row from './Row';
import HeaderRow from './HeaderRow';
import Card from './Card';
import { useBreakpoints } from 'react-breakpoints-hook';
import { BREAKPOINTS } from '../constants';
import { objectSort } from '../utils/helper_functions';
import { usePricesStore } from './Prices/state';

const selectOrderedIds = (state) => state.orderedIds;

function Table({ pageId, tableData, coins, defaultOrderBy, onRowClick }) {
  const orderedIds = usePricesStore(selectOrderedIds);
  const setOrderedIds = usePricesStore((state) => state.setOrderedIds);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState(defaultOrderBy);
  let { desktop } = useBreakpoints(BREAKPOINTS);
  const labelsAndIds = tableData.map((item) => ({ label: item.label, id: item.id }));
  const labelsAndIdsCard = tableData.slice(3).map((item) => ({ label: item.label, id: item.id }));

  const handleSort = useCallback(
    (_, cellId) => {
      setOrder(order === 'asc' ? 'desc' : 'asc');
      setOrderBy([cellId]);
    },
    [order]
  );

  useEffect(() => {
    if (orderedIds.length > 0) {
      setOrderedIds(objectSort(coins, order, orderBy));
    }
  }, [coins, order, orderBy]);

  return (
    <div className={styles.container}>
      {desktop ? (
        <>
          <div className={`${styles[pageId]} ${styles.header}`}>
            <HeaderRow
              headers={labelsAndIds}
              styles={styles}
              sortHandler={handleSort}
              order={order}
              orderBy={orderBy}
            />
          </div>
          {orderedIds.map((coinId) => (
            <div key={coinId} className={`${styles[pageId]} ${styles.data}`}>
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
          <div className={`${styles[pageId]} ${styles.cardHeader}`}>
            <HeaderRow
              headers={labelsAndIdsCard}
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
              coin={coins[coinId]}
              onCardClick={onRowClick}
            />
          ))}
        </>
      )}
    </div>
  );
}
export default Table;

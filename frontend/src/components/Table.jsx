import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useBreakpoints } from 'react-breakpoints-hook';

import { objectSort } from '../utils/helper_functions';
import Row from './Row';
import HeaderRow from './HeaderRow';
import GroupingHeader from './GroupingHeader';
import Card from './Card';
import { BREAKPOINTS } from '../constants';
import styles from './Table.module.scss';

function Table({
  pageId,
  orderedIds,
  setOrderedIds,
  tableData,
  coins,
  defaultOrderBy,
  onRowClick,
}) {
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState(defaultOrderBy);
  let { desktop } = useBreakpoints(BREAKPOINTS);
  const labelsAndIds = tableData.map((item) => ({ label: item.label, id: item.id }));
  const labelsAndIdsCard = tableData.slice(3).map((item) => ({ label: item.label, id: item.id }));
  const location = useLocation();

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
  }, [coins, order, orderBy]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={styles.container}>
      {desktop ? (
        <>
          <div className={`${styles[pageId]} ${styles.header}`}>
            <HeaderRow
              headers={labelsAndIds}
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
          <GroupingHeader />
          <div className={`${styles[pageId]} ${styles.cardHeader}`}>
            <HeaderRow
              headers={labelsAndIdsCard}
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

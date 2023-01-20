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

//TODO
export function stringComparator(a, b, order, orderBy) {
  // const multiplier = order === 'asc' ? 1 : -1;
  // return orderBy.reduce((acc, curr) => {
  //   acc ||= a[curr] - b[curr];
  //   return multiplier * acc;
  // }, false);
}

export function objectSort(obj, order, orderBy) {
  const res = Object.entries(obj)
    .sort(([_, av], [__, bv]) => comparator(av, bv, order, orderBy))
    .reduce((acc, [currk, _]) => [...acc, currk], []);
  return res;
}

function Table({ tableData, coins, styles }) {
  function handleSort() {}

  return (
    <div className={tableStyles.container}>
      <div className={`${styles.row} ${styles.header}`}>
        <HeaderRow
          headers={tableData}
          styles={styles}
          tableStyles={tableStyles}
          sortHandler={handleSort}
          order="asc"
          orderBy="market_cap_rank"
        />
      </div>
      {coins.order.map((coinGuid) => (
        <div key={coinGuid} className={`${styles.row} ${styles.data}`}>
          <Row tableData={tableData} row={coins.data[coinGuid]} styles={styles} />
        </div>
      ))}
    </div>
  );
}
export default Table;

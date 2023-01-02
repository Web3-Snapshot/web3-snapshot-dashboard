import styles from "./Table.module.css";
import Row from "./Row";

function Table({ tableData, coinProperties }) {
  return (
    <div className={styles.container}>
      <div className={`${styles.row} ${styles.header}`}>
        <Row header tableData={tableData} />
      </div>
      {Object.entries(coinProperties).map(([id, coin]) => (
        <div key={id} className={`${styles.row} ${styles.data}`}>
          <Row tableData={tableData} row={coin} />
        </div>
      ))}
    </div>
  );
}
export default Table;

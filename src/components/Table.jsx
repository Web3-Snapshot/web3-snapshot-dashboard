import tableStyles from "./Table.module.css";
import Row from "./Row";

function Table({ tableData, coinProperties, styles }) {
  return (
    <div className={tableStyles.container}>
      <div className={`${styles.row} ${styles.header}`}>
        <Row header tableData={tableData} styles={styles} />
      </div>
      {Object.entries(coinProperties).map(([id, coin]) => (
        <div key={id} className={`${styles.row} ${styles.data}`}>
          <Row tableData={tableData} row={coin} styles={styles} />
        </div>
      ))}
    </div>
  );
}
export default Table;

import React from "react";
import styles from "./Table.module.css";

const Row = ({ tableData, row, header }) => {
  return tableData.map((cell, idx) => (
    <div
      key={cell.id}
      style={{ justifyContent: idx === 1 ? "flex-start" : "center" }}
      className={styles.cell}
    >
      {header ? cell.label : cell.render(row)}
    </div>
  ));
};

Row.defaultProps = {
  row: [],
  header: false,
};

export default Row;

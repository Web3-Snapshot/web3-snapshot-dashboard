import React from "react";
import styles from "./Prices.module.css";

const Row = ({ tableData, row }) => {
  return tableData.map((cell) => (
    <span key={cell.id} className={styles.cell}>
      {cell.render(row)}
    </span>
  ));
};

export default Row;

import React from "react";
import styles from "./Prices.module.css";

function getDataStyles(rowIndex) {
  if (rowIndex > 1 && rowIndex % 2 === 0) {
    return styles.lightCell;
  }
  return "";
}

const Row = ({ tableData, row, header }) => {
  return tableData.map((cell, idx) => (
    <span
      key={cell.id}
      className={`${styles.cell} ${!header && getDataStyles(idx)}`}
    >
      {header ? cell.label : cell.render(row)}
    </span>
  ));
};

Row.defaultProps = {
  row: [],
  header: false,
};

export default Row;

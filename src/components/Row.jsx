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
    <div
      key={cell.id}
      style={{ justifyContent: idx === 1 ? "flex-start" : "center" }}
      className={`${styles.cell} ${!header && getDataStyles(idx)}`}
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

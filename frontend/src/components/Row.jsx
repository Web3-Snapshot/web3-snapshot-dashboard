import React from 'react';
import styles from './Row.module.scss';

const Row = ({ tableData, row, onRowClick }) => {
  return (
    <>
      {tableData.slice(0, 2).map((cell) => (
        <div key={cell.id} className={styles.cell} onClick={(evt) => onRowClick(evt, row, cell)}>
          {cell.render(row)}
        </div>
      ))}
      {tableData.slice(2).map((cell) => (
        <div key={cell.id} className={styles.cell} onClick={(evt) => onRowClick(evt, row, cell)}>
          {cell.renderOverlay && cell.renderOverlay(row)}
          {cell.render(row)}
        </div>
      ))}
    </>
  );
};

Row.defaultProps = {
  row: {},
};

export default Row;

import React from 'react';

const Row = ({ tableData, row, styles }) => {
  return (
    <>
      {tableData.slice(0, 2).map((cell) => (
        <div key={cell.id} className={styles.cell}>
          {cell.render(row)}
        </div>
      ))}
      {tableData.slice(2).map((cell) => (
        <div key={cell.id} className={styles.cell}>
          {cell.renderOverlay && cell.renderOverlay(row)}
          <div>{cell.render(row)}</div>
        </div>
      ))}
    </>
  );
};

Row.defaultProps = {
  row: [],
};

export default Row;

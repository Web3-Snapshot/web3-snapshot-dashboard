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
          <div
            style={{
              position: 'absolute',
              left: 0,
              backgroundColor: 'red',
              opacity: 0.2,
              width: '50%',
              height: '100%',
            }}></div>
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

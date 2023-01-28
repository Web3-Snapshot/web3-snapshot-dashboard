import React from 'react';

const Row = ({ tableData, row, styles }) => {
  return tableData.map((cell) => (
    <div key={cell.id} className={styles.cell}>
      {/* <div
        className={styles.stacked}
        style={{
          position: 'absolute',
          opacity: 0.3,
          backgroundColor: 'red',
          height: '4rem',
          // width: '100%',
        }}>
        Stacked
      </div> */}
      {cell.render(row)}
    </div>
  ));
};

Row.defaultProps = {
  row: [],
};

export default Row;

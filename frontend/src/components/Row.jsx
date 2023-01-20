import React from 'react';

const Row = ({ tableData, row, styles }) => {
  return tableData.map((cell) => (
    <div key={cell.id} className={styles.cell}>
      {cell.render(row)}
    </div>
  ));
};

Row.defaultProps = {
  row: [],
};

export default Row;

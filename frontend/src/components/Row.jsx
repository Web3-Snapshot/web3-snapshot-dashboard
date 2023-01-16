import React from 'react';

const Row = ({ tableData, row, header, styles }) => {
  return tableData.map((cell) => (
    <div key={cell.id} className={styles.cell}>
      {header ? cell.label : cell.render(row)}
    </div>
  ));
};

Row.defaultProps = {
  row: [],
  header: false,
};

export default Row;

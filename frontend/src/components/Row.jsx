import React from 'react';

const Row = ({ tableData, row, tableStyles }) => {
  return tableData.map((cell) => (
    <div key={cell.id} className={tableStyles.cell}>
      {cell.render(row)}
    </div>
  ));
};

Row.defaultProps = {
  row: [],
};

export default Row;

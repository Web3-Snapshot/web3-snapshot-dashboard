import React from 'react';
import { FaAngleDown, FaAngleUp } from 'react-icons/fa';

const HeaderRow = ({ headers, styles, sortHandler, order, orderBy }) => {
  return headers.map((cell) => (
    <div key={cell.id} className={styles.cell} onClick={(evt) => sortHandler(evt, cell.id)}>
      <FaAngleDown
        className={`${styles.iconDown} ${
          order === 'desc' && orderBy.includes(cell.id) && styles.iconActive
        }`}
      />
      <div className={styles.headerText}>{cell.label}</div>
      <FaAngleUp
        className={`${styles.iconUp} ${
          order === 'asc' && orderBy.includes(cell.id) && styles.iconActive
        }`}
      />
    </div>
  ));
};

HeaderRow.defaultProps = {
  row: [],
};

export default HeaderRow;

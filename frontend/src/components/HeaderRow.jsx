import React from 'react';
import { FaAngleDown, FaAngleUp } from 'react-icons/fa';

const HeaderRow = ({ headers, styles, sortHandler, order, orderBy }) => {
  return headers.map((cell) => (
    <div key={cell.id} className={styles.cell}>
      <FaAngleDown
        className={`${styles.iconDown} ${
          order === 'desc' && orderBy.includes(cell.id) && styles.iconActive
        }`}
        onClick={(evt) => sortHandler(evt, cell.id, 'desc')}
      />
      <span className={styles.headerText}>{cell.label}</span>
      <FaAngleUp
        className={`${styles.iconUp} ${
          order === 'asc' && orderBy.includes(cell.id) && styles.iconActive
        }`}
        onClick={(evt) => sortHandler(evt, cell.id, 'asc')}
      />
    </div>
  ));
};

HeaderRow.defaultProps = {
  row: [],
};

export default HeaderRow;

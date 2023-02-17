import React from 'react';
import { FaAngleDown, FaAngleUp } from 'react-icons/fa';

const HeaderRow = ({ headers, styles, sortHandler, order, orderBy }) => {
  return headers.map((cell) => (
    <div key={cell.id} className={styles.cell}>
      <div className={styles.leftSortArrowContainer}>
        <FaAngleDown
          className={`${styles.iconDown} ${
            order === 'desc' && orderBy.includes(cell.id) && styles.iconActive
          }`}
          onClick={(evt) => sortHandler(evt, cell.id, 'desc')}
        />
      </div>
      <div className={styles.headerText}>{cell.label}</div>
      <div className={styles.rightSortArrowContainer}>
        <FaAngleUp
          className={`${styles.iconUp} ${
            order === 'asc' && orderBy.includes(cell.id) && styles.iconActive
          }`}
          onClick={(evt) => sortHandler(evt, cell.id, 'asc')}
        />
      </div>
    </div>
  ));
};

HeaderRow.defaultProps = {
  row: [],
};

export default HeaderRow;

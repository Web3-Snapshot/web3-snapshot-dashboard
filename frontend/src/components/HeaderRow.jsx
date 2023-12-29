import React from 'react';
import { FaAngleDown, FaAngleUp } from 'react-icons/fa';
import styles from './HeaderRow.module.scss';

const HeaderRow = ({ headers, sortHandler, order, orderBy }) => {
  return headers.map((cell) => (
    <div key={cell.id} className={styles.cell} onClick={(evt) => sortHandler(evt, cell.id)}>
      <FaAngleDown
        className={`${styles.iconDown} ${
          order === 'desc' && orderBy.includes(cell.id) && styles.iconActive
        }`}
      />
      <div>{cell.label}</div>
      <FaAngleUp
        className={`${styles.iconUp} ${
          order === 'asc' && orderBy.includes(cell.id) && styles.iconActive
        }`}
      />
    </div>
  ));
};

export default HeaderRow;

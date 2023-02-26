import React from 'react';
import styles from './CellOverlay.module.scss';

export function renderCell(value, applyFunc) {
  if (value === null) {
    return '';
  }
  const colorClass = value >= 0 ? styles.positiveTextColor : styles.negativeTextColor;
  return <div className={colorClass}>{applyFunc(value)}</div>;
}

export function renderCellOverlay(value, originalValue) {
  if (!originalValue) {
    return <></>;
  } else if (originalValue >= 0) {
    return <Overlay width={`${value}`} className={styles.positiveValueBackground} />;
  } else if (originalValue < 0) {
    return <Overlay width={`${value}`} className={styles.negativeValueBackground} />;
  }
}

function Overlay({ width, className }) {
  return (
    <div
      className={`${className} ${styles.overlay}`}
      style={{
        width: `${width}%`,
      }}></div>
  );
}

export default Overlay;

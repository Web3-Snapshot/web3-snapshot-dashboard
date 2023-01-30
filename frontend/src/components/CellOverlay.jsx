import React from 'react';

export function renderCell(value, applyFunc) {
  const color = value >= 0 ? ' #3ebc9c' : '#bc1c39';
  return <div style={{ color }}>{applyFunc(value)}</div>;
}

export function renderCellOverlay(value, originalValue) {
  if (!originalValue) {
    return <></>;
  } else if (originalValue >= 0) {
    return <Overlay width={`${value}`} color="#062827" />;
  } else if (originalValue < 0) {
    return <Overlay width={`${value}`} color="#28080d" />;
  }
}

function Overlay({ width, color }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        backgroundColor: color,
        width: `${width}%`,
        height: '100%',
        zIndex: -1,
      }}></div>
  );
}

export default Overlay;

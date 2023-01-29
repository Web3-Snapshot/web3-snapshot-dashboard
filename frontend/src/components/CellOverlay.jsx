import React from 'react';

export function renderCellOverlay(value, originalValue) {
  if (!originalValue) {
    return <></>;
  } else if (originalValue >= 0) {
    return <Overlay width={`${value}`} color="green" />;
  } else if (originalValue < 0) {
    return <Overlay width={`${value}`} color="red" />;
  }
}

function Overlay({ width, color }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        backgroundColor: color,
        opacity: 0.2,
        width: `${width}%`,
        height: '100%',
      }}></div>
  );
}

export default Overlay;

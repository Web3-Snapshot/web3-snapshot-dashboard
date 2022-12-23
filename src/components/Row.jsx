import React from "react";

const Row = ({ row }) => {
  return (
    <div className='coin-row'>
      {row.length > 0 && (
        <>
          {row.map((cell, idx) => (
            <div key={cell.id} className={`column-${idx + 1}`}>
              {cell.value}
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default Row;

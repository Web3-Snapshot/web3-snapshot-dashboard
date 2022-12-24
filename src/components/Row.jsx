import React from "react";

const Row = ({ row }) => {
  return (
    <>
      {row.length > 0 &&
        row.map((cell) => (
          <span key={cell.id} className='cell'>
            {cell.value}
          </span>
        ))}
    </>
  );
};

export default Row;

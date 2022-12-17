import React from "react";

// function abbreviateMcCap(value) {
//   let newValue = value;
//   if (value >= 1000) {
//     let suffixes = ["", "k", "m", "b", "t"];
//     let suffixNum = Math.floor(("" + value).length / 3);
//     let shortValue = "";
//     for (let precision = 2; precision >= 1; precision--) {
//       shortValue = parseFloat(
//         (suffixNum !== 0
//           ? value / Math.pow(1000, suffixNum)
//           : value
//         ).toPrecision(precision)
//       );
//       let dotLessShortValue = (shortValue + "").replace(
//         /[^a-zA-Z 0-9]+/g,
//         ""
//       );
//       if (dotLessShortValue.length <= 2) {
//         break;
//       }
//     }
//     if (shortValue % 1 != 0) shortValue = shortValue.toFixed(1);
//     newValue = shortValue + suffixes[suffixNum];
//   }
//   console.log(newValue);
//   // const this.parent.newValue = newValue;
//   return newValue;
// }

const CoinItem2 = ({ additionalInfo }) => {
  return (
    <div className='coin-row' alt='asd'>
      {additionalInfo && (
        <>
          <p className='coin-col-1'>
            {additionalInfo.market_data.market_cap_rank}
          </p>
          <div className='img-symbol coin-col-2'>
            <img src={additionalInfo.image.thumb} alt='coin' />
            <p>{additionalInfo.symbol.toUpperCase()}</p>
          </div>
          <p className='coin-col-3 hide-mobile'>
            ${additionalInfo.market_data.market_cap.usd.toLocaleString()}
          </p>
          <p>"MK cap"</p> {/* Mk cap */}
          <p>-</p> {/* FD Mk cap */}
          <p>{additionalInfo.market_data.total_supply}</p>
          <p>{additionalInfo.market_data.max_supply || "-"}</p>
          <p>{additionalInfo.market_data.total_volume.usd || "-"}</p>
          {/* <p className='hide-mobile'>${coins.total_volume.toLocaleString()}</p> */}
        </>
      )}
    </div>
  );
};

export default CoinItem2;

import React from "react";

const CoinItem = (props) => {
  // const value = props.coins.market_cap.toLocaleString();
  const value = props.coins.market_cap;
  // const newValue = props.coins.market_cap;

  function abbreviateMcCap(value) {
    let newValue = value;
    if (value >= 1000) {
      let suffixes = ["", "k", "m", "b", "t"];
      let suffixNum = Math.floor(("" + value).length / 3);
      let shortValue = "";
      for (let precision = 2; precision >= 1; precision--) {
        shortValue = parseFloat(
          (suffixNum !== 0
            ? value / Math.pow(1000, suffixNum)
            : value
          ).toPrecision(precision)
        );
        let dotLessShortValue = (shortValue + "").replace(
          /[^a-zA-Z 0-9]+/g,
          ""
        );
        if (dotLessShortValue.length <= 2) {
          break;
        }
      }
      if (shortValue % 1 != 0) shortValue = shortValue.toFixed(1);
      newValue = shortValue + suffixes[suffixNum];
    }
    console.log(newValue);
    // const this.parent.newValue = newValue;
    return newValue;
  }
  abbreviateMcCap(value);
  // console.log(newValue);

  return (
    <div className='coin-row' alt='asd'>
      <p className='coin-col-1'>{props.coins.market_cap_rank}</p>
      <div className='img-symbol coin-col-2'>
        <img src={props.coins.image} alt='coin' />
        <p>{props.coins.symbol.toUpperCase()}</p>
      </div>
      <p className='coin-col-3 hide-mobile'>
        {/* here we should have "newValue" instead of the line below */}$
        {props.coins.market_cap.toLocaleString()}
      </p>{" "}
      {/* Mk cap */}
      <p>-</p> {/* FD Mk cap */}
      <p>-</p> {/* supply */}
      <p>-</p> {/* supply total */}
      <p>-</p> {/* supply max */}
      <p className='hide-mobile'>
        ${props.coins.total_volume.toLocaleString()}
      </p>
    </div>
  );
};

export default CoinItem;

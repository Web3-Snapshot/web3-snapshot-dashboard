import React from "react";

const CoinItem = (props) => {
  // const value = props.coins.market_cap.toLocaleString();
  const value = props.coins.market_cap;
  // const newValue = props.coins.market_cap;

  function abbreviateMcCap(value) {
    let newValue = value;
    if (value >= 1000) {
      var suffixes = ["", "k", "m", "b", "t"];
      var suffixNum = Math.floor(("" + value).length / 3);
      var shortValue = "";
      for (var precision = 2; precision >= 1; precision--) {
        shortValue = parseFloat(
          (suffixNum != 0
            ? value / Math.pow(1000, suffixNum)
            : value
          ).toPrecision(precision)
        );
        var dotLessShortValue = (shortValue + "").replace(
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
    <div className="coin-row" alt="asd">
      <p className="coin-col-1">{props.coins.market_cap_rank}</p>
      <div className="img-symbol coin-col-2">
        <img src={props.coins.image} />
        <p>{props.coins.symbol.toUpperCase()}</p>
      </div>
      <p className="coin-col-3 hide-mobile">
        ${props.coins.market_cap.toLocaleString()}
      </p>{" "}
      {/* Mk cap */}
      <p>-</p> {/* FD Mk cap */}
      <p>-</p> {/* supply */}
      <p>-</p> {/* supply total */}
      <p>-</p> {/* supply max */}
      <p className="hide-mobile">
        ${props.coins.total_volume.toLocaleString()}
      </p>
    </div>
  );
};

export default CoinItem;

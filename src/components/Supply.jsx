import React from "react";
import Row from "./Row";
import { useOutletContext } from "react-router-dom";

import "./Coins.css";

function IconAndCurrencyId({ additionalInfo }) {
  return (
    <div className='img-symbol coin-col-2'>
      <img src={additionalInfo.image.thumb} alt='coin' />
      <p>{additionalInfo.symbol.toUpperCase()}</p>
    </div>
  );
}

function Supply() {
  const { coins, coinProperties } = useOutletContext();

  const cellHeaders = [
    "#",
    "Coin",
    "Market Cap",
    "FD Market Cap",
    "Total Supply",
    "Max Supply",
    "Total Volume",
  ];

  function getCellData(additionalInfo) {
    return [
      {
        id: "marketCapRank",
        value: additionalInfo.market_data.market_cap_rank,
      },
      {
        id: "icon",
        value: <IconAndCurrencyId additionalInfo={additionalInfo} />,
      },
      {
        id: "marketCapUSD",
        value: `$${additionalInfo.market_data.market_cap.usd.toLocaleString()}`,
      },
      {
        id: "FDMarketCap",
        value: `$${additionalInfo.market_data.market_cap.usd.toLocaleString()}`,
      },
      {
        id: "totalSupply",
        value: additionalInfo.market_data.total_supply,
      },
      {
        id: "maxSupply",
        value: additionalInfo.market_data.max_supply,
      },
      {
        id: "totalVolumeUSD",
        value: additionalInfo.market_data.total_volume.usd.toLocaleString(),
      },
    ];
  }

  return (
    <div className='container'>
      {coins && (
        <div>
          <div className='row header'>
            {cellHeaders.map((header) => (
              <span className='cell'>{header}</span>
            ))}
          </div>

          {coins.map((coin, idx) => {
            return (
              <div className='row data'>
                <Row key={coin.id} row={getCellData(coinProperties[coin.id])} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Supply;

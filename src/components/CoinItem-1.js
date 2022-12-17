import React from "react";

const CoinItem1 = ({ additionalInfo }) => {
  return (
    <div className='coin-row' alt='coinRow'>
      {additionalInfo && (
        <>
          <p className='coin-col-1'>
            {additionalInfo.market_data.market_cap_rank}
          </p>
          <div className='img-symbol coin-col-2'>
            <img
              alt='coin-symbol'
              className='img-symbol-1'
              src={additionalInfo.image.thumb}
            />
            <p className='img-symbol-2'>
              {additionalInfo.symbol.toUpperCase()}
            </p>
          </div>
          <p className='coin-col-3'>
            ${additionalInfo.market_data.current_price.usd.toLocaleString()}
          </p>
          <p className='coin-col-4'>
            {additionalInfo.market_data.price_change_percentage_24h_in_currency.usd.toFixed(
              2
            )}
            %
          </p>
          <p>
            {
              additionalInfo.market_data.price_change_percentage_7d_in_currency
                .usd
            }
          </p>
          <p>
            {
              additionalInfo.market_data.price_change_percentage_30d_in_currency
                .usd
            }
          </p>
          <p>
            {
              additionalInfo.market_data.price_change_percentage_60d_in_currency
                .usd
            }
          </p>
          <p>
            {
              additionalInfo.market_data
                .price_change_percentage_200d_in_currency.usd
            }
          </p>
        </>
      )}
    </div>
  );
};

export default CoinItem1;

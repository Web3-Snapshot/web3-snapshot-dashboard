import { create } from 'zustand';
import zukeeper from 'zukeeper';

export const usePricesStore = create(
  zukeeper((set) => ({
    rows: [],
    updatedAt: null,
    setRows: (fetchedRows) =>
      set((state) => {
        fetchedRows = fetchedRows.map((row) => ({
          id: row.id,
          symbol: row.symbol,
          image: row.image,
          market_cap_rank: row.market_cap_rank,
          current_price: row.current_price,
          price_change_percentage_24h_in_currency: row.price_change_percentage_24h_in_currency,
          price_change_percentage_24h_in_currency_relative:
            row.price_change_percentage_24h_in_currency_relative,
          price_change_percentage_7d_in_currency: row.price_change_percentage_7d_in_currency,
          price_change_percentage_7d_in_currency_relative:
            row.price_change_percentage_7d_in_currency_relative,
          price_change_percentage_30d_in_currency: row.price_change_percentage_30d_in_currency,
          price_change_percentage_30d_in_currency_relative:
            row.price_change_percentage_30d_in_currency_relative,
          price_change_percentage_1y_in_currency: row.price_change_percentage_1y_in_currency,
          price_change_percentage_1y_in_currency_relative:
            row.price_change_percentage_1y_in_currency_relative,
          ath_change_percentage: row.ath_change_percentage,
          ath_change_percentage_relative: row.ath_change_percentage_relative,
        }));

        return { rows: normalizeResponse(fetchedRows) };
      }),
    unsetRows: () => set((state) => ({ rows: [] })),
    setUpdatedAt: (updatedAt) => set((state) => ({ updatedAt })),
  }))
);

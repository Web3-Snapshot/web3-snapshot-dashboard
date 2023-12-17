import { create } from 'zustand';
import zukeeper from 'zukeeper';
import { normalizeResponse } from '../../util/helpers';

export const usePricesStore = create(
  zukeeper((set) => ({
    rows: [],
    setRows: (fetchedRows) =>
      set((state) => {
        const filteredRows = fetchedRows.map((row) => {
          return {
            market_cap_rank: row.market_cap_rank,
            symbol: row.symbol,
            market_cap: row.market_cap,
            fully_diluted_valuation: row.fully_diluted_valuation,
            circulating_supply: row.circulating_supply,
            total_supply: row.total_supply,
            max_supply: row.max_supply,
            total_volume: row.total_volume,
          };
        });
        return { rows: normalizeResponse(filteredRows) };
      }),
    unsetRows: () => set((state) => ({ rows: [] })),
  }))
);

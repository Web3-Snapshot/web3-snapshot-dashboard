import { create } from 'zustand';
import zukeeper from 'zukeeper';

export const useTokenomicsStore = create(
  zukeeper((set) => ({
    rows: [],
    setRows: (fetchedRows) =>
      set((state) => {
        fetchedRows = fetchedRows.map((row) => ({
          id: row.id,
          symbol: row.symbol,
          image: row.image,
          market_cap_rank: row.market_cap_rank,
          market_cap: row.market_cap,
          fully_diluted_valuation: row.fully_diluted_valuation,
          circulating_supply: row.circulating_supply,
          circ_supply_total_supply_ratio: row.circ_supply_total_supply_ratio,
          mc_fdv_ratio: row.mc_fdv_ratio,
          total_supply: row.total_supply,
          max_supply: row.max_supply,
          total_volume: row.total_volume,
        }));

        return { rows: normalizeResponse(fetchedRows) };
      }),
    unsetRows: () => set((state) => ({ rows: [] })),
  }))
);

import { create } from 'zustand';
import zukeeper from 'zukeeper';

export const usePricesStore = create(
  zukeeper((set) => ({
    rows: [],
    order: [],
    updatedAt: null,
    setRows: (fetchedRows) => set((state) => ({ rows: fetchedRows })),
    unsetRows: () => set((state) => ({ rows: [] })),
    setOrder: (order) => set((state) => ({ order })),
    setUpdatedAt: (updatedAt) => set((state) => ({ updatedAt })),
  }))
);

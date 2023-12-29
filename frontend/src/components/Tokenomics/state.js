import { create } from 'zustand';
import zukeeper from 'zukeeper';

export const useTokenomicsStore = create(
  zukeeper((set) => ({
    rows: {},
    orderedIds: [],
    updatedAt: null,
    setRows: (fetchedRows) => set((state) => ({ rows: fetchedRows })),
    unsetRows: () => set((state) => ({ rows: [] })),
    setOrderedIds: (orderedIds) => set((state) => ({ orderedIds })),
    setUpdatedAt: (updatedAt) => set((state) => ({ updatedAt })),
  }))
);

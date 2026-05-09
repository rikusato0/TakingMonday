import React, { createContext, useContext, useMemo, useSyncExternalStore, type ReactNode } from 'react';
import * as mockBackend from '../services/mockBackend';
import type { WallEntryRow } from '../services/mockBackend';

type AppData = {
  counters: mockBackend.CounterStateRow;
  publicWall: mockBackend.WallEntryRow[];
  allWall: mockBackend.WallEntryRow[];
  incrementGoodThings: () => Promise<void>;
  incrementGoodWishes: () => Promise<void>;
  incrementWallPerson: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
  adminSaveWallEntry: (e: WallEntryRow) => Promise<void>;
  adminDeleteWallEntry: (id: string) => Promise<void>;
  adminReorderWall: (ids: string[]) => Promise<void>;
};

const Ctx = createContext<AppData | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const data = useSyncExternalStore(mockBackend.subscribe, mockBackend.getSnapshot, mockBackend.getSnapshot);

  const value = useMemo<AppData>(() => {
    const publicWall = mockBackend.getPublicWall();
    return {
      counters: data.counters,
      publicWall,
      allWall: data.wall.slice().sort((a, b) => a.sortOrder - b.sortOrder),
      incrementGoodThings: () => mockBackend.incrementGoodThings(),
      incrementGoodWishes: () => mockBackend.incrementGoodWishes(),
      incrementWallPerson: (id: string) => mockBackend.incrementWallPerson(id),
      refresh: () => mockBackend.refreshFromStorage(),
      adminSaveWallEntry: (e) => mockBackend.adminSaveWallEntry(e),
      adminDeleteWallEntry: (id) => mockBackend.adminDeleteWallEntry(id),
      adminReorderWall: (ids) => mockBackend.adminReorderWall(ids),
    };
  }, [data]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppData() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAppData outside AppDataProvider');
  return v;
}

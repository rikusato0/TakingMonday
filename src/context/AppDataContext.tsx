import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import * as appBackend from '../services/appBackend';
import type { WallEntryRow } from '../services/appBackend';

type AppData = {
  counters: appBackend.CounterStateRow;
  publicWall: appBackend.WallEntryRow[];
  allWall: appBackend.WallEntryRow[];
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
  const data = useSyncExternalStore(appBackend.subscribe, appBackend.getSnapshot, appBackend.getSnapshot);

  useEffect(() => {
    void appBackend.hydrate();
  }, []);

  const value = useMemo<AppData>(() => {
    const publicWall = appBackend.getPublicWall();
    return {
      counters: data.counters,
      publicWall,
      allWall: data.wall.slice().sort((a, b) => a.sortOrder - b.sortOrder),
      incrementGoodThings: () => appBackend.incrementGoodThings(),
      incrementGoodWishes: () => appBackend.incrementGoodWishes(),
      incrementWallPerson: (id: string) => appBackend.incrementWallPerson(id),
      refresh: () => appBackend.refreshFromStorage(),
      adminSaveWallEntry: (e) => appBackend.adminSaveWallEntry(e),
      adminDeleteWallEntry: (id) => appBackend.adminDeleteWallEntry(id),
      adminReorderWall: (ids) => appBackend.adminReorderWall(ids),
    };
  }, [data]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppData() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAppData outside AppDataProvider');
  return v;
}

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import {
  signInAdmin as svcSignInAdmin,
  signOutAdmin as svcSignOutAdmin,
  subscribeAdminAuth,
  type AdminAuthState,
  type AdminUser,
} from '../services/adminAuth';
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
  // Admin auth
  admin: AdminUser | null;
  isAdmin: boolean;
  adminInitializing: boolean;
  signInAdmin: (email: string, password: string) => Promise<AdminUser>;
  signOutAdmin: () => Promise<void>;
};

const Ctx = createContext<AppData | null>(null);

const initialAuth: AdminAuthState = {
  user: null,
  isAdmin: false,
  initializing: true,
};

export function AppDataProvider({ children }: { children: ReactNode }) {
  const data = useSyncExternalStore(appBackend.subscribe, appBackend.getSnapshot, appBackend.getSnapshot);
  const [authState, setAuthState] = useState<AdminAuthState>(initialAuth);

  useEffect(() => {
    void appBackend.hydrate();
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeAdminAuth(setAuthState);
    return () => {
      unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const user = await svcSignInAdmin(email, password);
    // onAuthStateChanged in subscribeAdminAuth will flip isAdmin/user, but
    // we also re-hydrate so any admin-only data the rules now allow loads.
    void appBackend.refreshFromStorage();
    return user;
  }, []);

  const signOut = useCallback(async () => {
    await svcSignOutAdmin();
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
      admin: authState.user,
      isAdmin: authState.isAdmin,
      adminInitializing: authState.initializing,
      signInAdmin: signIn,
      signOutAdmin: signOut,
    };
  }, [data, authState, signIn, signOut]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppData() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAppData outside AppDataProvider');
  return v;
}

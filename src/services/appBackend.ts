import * as firebaseBackend from './firebaseBackend';
import * as mockBackend from './mockBackend';

const shouldUseFirebase = process.env.EXPO_PUBLIC_USE_FIREBASE === '1' && firebaseBackend.isFirebaseReady();

const backend = shouldUseFirebase ? firebaseBackend : mockBackend;

export const subscribe = backend.subscribe;
export const getSnapshot = backend.getSnapshot;
export const hydrate = backend.hydrate;
export const refreshFromStorage = backend.refreshFromStorage;
export const getPublicWall = backend.getPublicWall;
export const incrementGoodThings = backend.incrementGoodThings;
export const incrementGoodWishes = backend.incrementGoodWishes;
export const incrementWallPerson = backend.incrementWallPerson;
export const adminSaveWallEntry = backend.adminSaveWallEntry;
export const adminDeleteWallEntry = backend.adminDeleteWallEntry;
export const adminReorderWall = backend.adminReorderWall;

export type { CounterStateRow, WallEntryRow } from './mockBackend';
export { RateLimitError } from './mockBackend';

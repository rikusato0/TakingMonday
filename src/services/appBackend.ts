import * as firebaseBackend from './firebaseBackend';

const backend = firebaseBackend;

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

export type { CounterStateRow, WallEntryRow } from './firebaseBackend';
export { RateLimitError } from './firebaseBackend';

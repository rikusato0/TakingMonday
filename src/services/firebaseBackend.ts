import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  onSnapshot,
  query,
  orderBy,
  setDoc,
  writeBatch,
} from 'firebase/firestore';
import { RATE_LIMIT_MESSAGE } from '../constants/config';
import { getEasternDateString } from '../utils/easternDate';
import { db, firebaseEnabled } from './firebaseApp';
import { tryConsumeClickSync, undoConsumeClickSync, warmClickBudgetCache } from './clickBudget';

export class RateLimitError extends Error {
  constructor(message = RATE_LIMIT_MESSAGE) {
    super(message);
    this.name = 'RateLimitError';
  }
}

export interface CounterStateRow {
  goodThingsTotal: number;
  goodThingsToday: number;
  goodWishesTotal: number;
  goodWishesToday: number;
  lastResetDate: string;
}

export interface WallEntryRow {
  id: string;
  displayName: string;
  location: string;
  totalWishes: number;
  active: boolean;
  sortOrder: number;
}

const COUNTERS_COLLECTION = 'counters';
const COUNTERS_DOC_ID = 'global';
const WALL_COLLECTION = 'wall_entries';

type DataSnapshot = {
  counters: CounterStateRow;
  wall: WallEntryRow[];
};

const listeners = new Set<() => void>();

const defaultCounters = (): CounterStateRow => {
  const today = getEasternDateString();
  return {
    goodThingsTotal: 0,
    goodThingsToday: 0,
    goodWishesTotal: 0,
    goodWishesToday: 0,
    lastResetDate: today,
  };
};

/** Last known Firestore truth (after daily reset normalization). */
let serverCounters: CounterStateRow = defaultCounters();
let serverWall: WallEntryRow[] = [];
/** Per-entry server `totalWishes` at last wall snapshot — used to reconcile optimistic wall taps. */
let lastWallTotals: Record<string, number> = {};

let pendingGoodThings = 0;
let pendingGoodWishes = 0;
const wallPending: Record<string, number> = {};

let snapshot: DataSnapshot = {
  counters: defaultCounters(),
  wall: [],
};

let realtimeStarted = false;

function notify() {
  listeners.forEach((listener) => listener());
}

function ensureReady() {
  if (!firebaseEnabled || !db) {
    throw new Error('Firebase is not configured. Set EXPO_PUBLIC_FIREBASE_* values and restart Expo.');
  }
}

function applyDailyReset(counters: CounterStateRow): CounterStateRow {
  const today = getEasternDateString();
  if (counters.lastResetDate === today) return counters;
  return {
    ...counters,
    goodThingsToday: 0,
    goodWishesToday: 0,
    lastResetDate: today,
  };
}

function countersNeedPersistAfterDailyReset(raw: CounterStateRow, normalized: CounterStateRow): boolean {
  return (
    raw.lastResetDate !== normalized.lastResetDate ||
    raw.goodThingsToday !== normalized.goodThingsToday ||
    raw.goodWishesToday !== normalized.goodWishesToday
  );
}

async function persistDailyResetIfNeeded(onDisk: CounterStateRow): Promise<void> {
  ensureReady();
  const normalized = applyDailyReset(onDisk);
  if (!countersNeedPersistAfterDailyReset(onDisk, normalized)) return;

  await setDoc(
    doc(db!, COUNTERS_COLLECTION, COUNTERS_DOC_ID),
    {
      goodThingsToday: normalized.goodThingsToday,
      goodWishesToday: normalized.goodWishesToday,
      lastResetDate: normalized.lastResetDate,
    },
    { merge: true },
  );
}

function normalizeWallEntry(id: string, data: Partial<WallEntryRow>): WallEntryRow {
  return {
    id,
    displayName: data.displayName ?? '',
    location: data.location ?? '',
    totalWishes: typeof data.totalWishes === 'number' ? data.totalWishes : 0,
    active: typeof data.active === 'boolean' ? data.active : true,
    sortOrder: typeof data.sortOrder === 'number' ? data.sortOrder : 0,
  };
}

function effectiveCounters(): CounterStateRow {
  const s = serverCounters;
  return {
    ...s,
    goodThingsTotal: s.goodThingsTotal + pendingGoodThings,
    goodThingsToday: s.goodThingsToday + pendingGoodThings,
    goodWishesTotal: s.goodWishesTotal + pendingGoodWishes,
    goodWishesToday: s.goodWishesToday + pendingGoodWishes,
  };
}

function effectiveWall(): WallEntryRow[] {
  return serverWall.map((e) => ({
    ...e,
    totalWishes: e.totalWishes + (wallPending[e.id] ?? 0),
  }));
}

function rebuildSnapshot() {
  snapshot = {
    counters: effectiveCounters(),
    wall: effectiveWall(),
  };
}

async function loadServerSnapshotOnce(): Promise<{ counters: CounterStateRow; wall: WallEntryRow[] }> {
  ensureReady();
  const countersRef = doc(db!, COUNTERS_COLLECTION, COUNTERS_DOC_ID);
  const countersSnap = await getDoc(countersRef);

  let counters = defaultCounters();
  if (countersSnap.exists()) {
    const raw = countersSnap.data() as CounterStateRow;
    counters = applyDailyReset(raw);
    await persistDailyResetIfNeeded(raw);
  } else {
    counters = applyDailyReset(counters);
    await setDoc(countersRef, counters, { merge: true });
  }

  const wallQuery = query(collection(db!, WALL_COLLECTION), orderBy('sortOrder'));
  const wallSnap = await getDocs(wallQuery);
  const wall = wallSnap.docs.map((entryDoc) =>
    normalizeWallEntry(entryDoc.id, entryDoc.data() as Partial<WallEntryRow>),
  );

  return { counters, wall };
}

function applyCountersFromServer(raw: CounterStateRow) {
  const normalized = applyDailyReset(raw);
  if (countersNeedPersistAfterDailyReset(raw, normalized)) {
    persistDailyResetIfNeeded(raw).catch((err: unknown) => {
      console.warn('[TakingMonday] daily reset persist:', (err as Error)?.message ?? err);
    });
  }
  const prev = serverCounters;
  const dt = normalized.goodThingsTotal - prev.goodThingsTotal;
  if (dt > 0) {
    pendingGoodThings = Math.max(0, pendingGoodThings - dt);
  }
  const dw = normalized.goodWishesTotal - prev.goodWishesTotal;
  if (dw > 0) {
    pendingGoodWishes = Math.max(0, pendingGoodWishes - dw);
  }
  serverCounters = normalized;
  rebuildSnapshot();
  notify();
}

function applyWallFromServer(rows: WallEntryRow[]) {
  const prevTotals = lastWallTotals;
  for (const row of rows) {
    const prevTotal = prevTotals[row.id];
    if (prevTotal !== undefined) {
      const d = row.totalWishes - prevTotal;
      if (d > 0) {
        const p = wallPending[row.id] ?? 0;
        if (p > 0) {
          const next = Math.max(0, p - d);
          if (next === 0) {
            delete wallPending[row.id];
          } else {
            wallPending[row.id] = next;
          }
        }
      }
    }
  }
  serverWall = rows;
  lastWallTotals = Object.fromEntries(rows.map((r) => [r.id, r.totalWishes]));
  rebuildSnapshot();
  notify();
}

function startRealtimeListeners() {
  if (!db || realtimeStarted) return;
  realtimeStarted = true;

  const countersRef = doc(db, COUNTERS_COLLECTION, COUNTERS_DOC_ID);
  onSnapshot(
    countersRef,
    (docSnap) => {
      if (!docSnap.exists()) return;
      applyCountersFromServer(docSnap.data() as CounterStateRow);
    },
    (err) => {
      console.warn('[TakingMonday] counters listener error:', err?.message ?? err);
    },
  );

  const wallQuery = query(collection(db, WALL_COLLECTION), orderBy('sortOrder'));
  onSnapshot(
    wallQuery,
    (qSnap) => {
      const rows = qSnap.docs.map((d) =>
        normalizeWallEntry(d.id, d.data() as Partial<WallEntryRow>),
      );
      applyWallFromServer(rows);
    },
    (err) => {
      console.warn('[TakingMonday] wall listener error:', err?.message ?? err);
    },
  );
}

export function isFirebaseReady() {
  return firebaseEnabled && Boolean(db);
}

export function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function getSnapshot(): DataSnapshot {
  return snapshot;
}

export async function hydrate(): Promise<void> {
  ensureReady();
  await warmClickBudgetCache();
  const loaded = await loadServerSnapshotOnce();
  serverCounters = loaded.counters;
  serverWall = loaded.wall;
  lastWallTotals = Object.fromEntries(loaded.wall.map((r) => [r.id, r.totalWishes]));
  rebuildSnapshot();
  notify();
  startRealtimeListeners();
}

export async function refreshFromStorage(): Promise<void> {
  ensureReady();
  await warmClickBudgetCache();
  const loaded = await loadServerSnapshotOnce();
  serverCounters = loaded.counters;
  serverWall = loaded.wall;
  lastWallTotals = Object.fromEntries(loaded.wall.map((r) => [r.id, r.totalWishes]));
  pendingGoodThings = 0;
  pendingGoodWishes = 0;
  for (const k of Object.keys(wallPending)) {
    delete wallPending[k];
  }
  rebuildSnapshot();
  notify();
}

export async function incrementGoodThings() {
  ensureReady();
  if (!tryConsumeClickSync()) {
    throw new RateLimitError();
  }
  pendingGoodThings += 1;
  rebuildSnapshot();
  notify();

  const countersRef = doc(db!, COUNTERS_COLLECTION, COUNTERS_DOC_ID);
  const today = getEasternDateString();

  try {
    await setDoc(
      countersRef,
      {
        goodThingsTotal: increment(1),
        goodThingsToday: increment(1),
        lastResetDate: today,
      },
      { merge: true },
    );
  } catch (e) {
    pendingGoodThings = Math.max(0, pendingGoodThings - 1);
    undoConsumeClickSync();
    rebuildSnapshot();
    notify();
    throw e;
  }
}

export async function incrementGoodWishes() {
  ensureReady();
  if (!tryConsumeClickSync()) {
    throw new RateLimitError();
  }
  pendingGoodWishes += 1;
  rebuildSnapshot();
  notify();

  const countersRef = doc(db!, COUNTERS_COLLECTION, COUNTERS_DOC_ID);
  const today = getEasternDateString();

  try {
    await setDoc(
      countersRef,
      {
        goodWishesTotal: increment(1),
        goodWishesToday: increment(1),
        lastResetDate: today,
      },
      { merge: true },
    );
  } catch (e) {
    pendingGoodWishes = Math.max(0, pendingGoodWishes - 1);
    undoConsumeClickSync();
    rebuildSnapshot();
    notify();
    throw e;
  }
}

export async function incrementWallPerson(personId: string) {
  ensureReady();
  if (!serverWall.some((w) => w.id === personId)) {
    throw new Error('That entry is no longer on the wall.');
  }
  if (!tryConsumeClickSync()) {
    throw new RateLimitError();
  }
  wallPending[personId] = (wallPending[personId] ?? 0) + 1;
  rebuildSnapshot();
  notify();

  const targetRef = doc(db!, WALL_COLLECTION, personId);

  try {
    await setDoc(targetRef, { totalWishes: increment(1) }, { merge: true });
  } catch (e) {
    const cur = wallPending[personId] ?? 0;
    if (cur <= 1) {
      delete wallPending[personId];
    } else {
      wallPending[personId] = cur - 1;
    }
    undoConsumeClickSync();
    rebuildSnapshot();
    notify();
    throw e;
  }
}

export function getPublicWall(): WallEntryRow[] {
  return snapshot.wall
    .filter((entry) => entry.active)
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function adminSaveWallEntry(entry: WallEntryRow) {
  ensureReady();
  await setDoc(doc(db!, WALL_COLLECTION, entry.id), entry, { merge: true });
}

export async function adminDeleteWallEntry(id: string) {
  ensureReady();
  await deleteDoc(doc(db!, WALL_COLLECTION, id));
}

export async function adminReorderWall(orderedIds: string[]) {
  ensureReady();
  const batch = writeBatch(db!);

  orderedIds.forEach((id, sortOrder) => {
    const ref = doc(db!, WALL_COLLECTION, id);
    batch.set(ref, { sortOrder }, { merge: true });
  });

  await batch.commit();
}

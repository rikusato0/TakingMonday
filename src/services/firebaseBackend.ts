import {
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  runTransaction,
  setDoc,
  writeBatch,
  query,
  orderBy,
} from 'firebase/firestore';
import { MAX_CLICKS_PER_DAY } from '../constants/config';
import { getEasternDateString } from '../utils/easternDate';
import { db, firebaseEnabled } from './firebaseApp';
import { RateLimitError, type CounterStateRow, type WallEntryRow } from './mockBackend';
import { getClicksUsedToday, tryConsumeClick } from './clickBudget';

const COUNTERS_COLLECTION = 'counters';
const COUNTERS_DOC_ID = 'global';
const WALL_COLLECTION = 'wall_entries';

type Snapshot = {
  counters: CounterStateRow;
  wall: WallEntryRow[];
};

const listeners = new Set<() => void>();

const defaultCounters = (): CounterStateRow => {
  const today = getEasternDateString();
  return {
    goodThingsTotal: 45820,
    goodThingsToday: 150,
    goodWishesTotal: 12890,
    goodWishesToday: 42,
    lastResetDate: today,
  };
};

let snapshot: Snapshot = {
  counters: defaultCounters(),
  wall: [],
};

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

async function loadSnapshot(): Promise<Snapshot> {
  ensureReady();
  const countersRef = doc(db!, COUNTERS_COLLECTION, COUNTERS_DOC_ID);
  const countersSnap = await getDoc(countersRef);

  let counters = defaultCounters();
  if (countersSnap.exists()) {
    counters = applyDailyReset(countersSnap.data() as CounterStateRow);
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

export function isFirebaseReady() {
  return firebaseEnabled && Boolean(db);
}

export function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function getSnapshot(): Snapshot {
  return snapshot;
}

export async function hydrate(): Promise<void> {
  snapshot = await loadSnapshot();
  notify();
}

export async function refreshFromStorage(): Promise<void> {
  await hydrate();
}

async function ensureClickBudget() {
  const used = await getClicksUsedToday();
  if (used >= MAX_CLICKS_PER_DAY) {
    throw new RateLimitError();
  }

  const consumed = await tryConsumeClick();
  if (!consumed) {
    throw new RateLimitError();
  }
}

export async function incrementGoodThings() {
  ensureReady();
  await ensureClickBudget();
  const countersRef = doc(db!, COUNTERS_COLLECTION, COUNTERS_DOC_ID);
  const today = getEasternDateString();

  await runTransaction(db!, async (tx) => {
    const snap = await tx.get(countersRef);
    const base = snap.exists() ? (snap.data() as CounterStateRow) : defaultCounters();
    const normalized = applyDailyReset(base);
    tx.set(
      countersRef,
      {
        ...normalized,
        goodThingsTotal: increment(1),
        goodThingsToday: increment(1),
        lastResetDate: today,
      },
      { merge: true },
    );
  });

  await hydrate();
}

export async function incrementGoodWishes() {
  ensureReady();
  await ensureClickBudget();
  const countersRef = doc(db!, COUNTERS_COLLECTION, COUNTERS_DOC_ID);
  const today = getEasternDateString();

  await runTransaction(db!, async (tx) => {
    const snap = await tx.get(countersRef);
    const base = snap.exists() ? (snap.data() as CounterStateRow) : defaultCounters();
    const normalized = applyDailyReset(base);
    tx.set(
      countersRef,
      {
        ...normalized,
        goodWishesTotal: increment(1),
        goodWishesToday: increment(1),
        lastResetDate: today,
      },
      { merge: true },
    );
  });

  await hydrate();
}

export async function incrementWallPerson(personId: string) {
  ensureReady();
  await ensureClickBudget();
  const targetRef = doc(db!, WALL_COLLECTION, personId);
  const targetSnap = await getDoc(targetRef);
  if (!targetSnap.exists()) {
    throw new Error('That entry is no longer on the wall.');
  }
  await setDoc(targetRef, { totalWishes: increment(1) }, { merge: true });
  await hydrate();
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
  await hydrate();
}

export async function adminDeleteWallEntry(id: string) {
  ensureReady();
  await setDoc(doc(db!, WALL_COLLECTION, id), { active: false }, { merge: true });
  await hydrate();
}

export async function adminReorderWall(orderedIds: string[]) {
  ensureReady();
  const batch = writeBatch(db!);

  orderedIds.forEach((id, sortOrder) => {
    const ref = doc(db!, WALL_COLLECTION, id);
    batch.set(ref, { sortOrder }, { merge: true });
  });

  await batch.commit();
  await hydrate();
}

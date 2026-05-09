import AsyncStorage from '@react-native-async-storage/async-storage';
import { RATE_LIMIT_MESSAGE } from '../constants/config';
import { tryConsumeClick } from './clickBudget';
import { getEasternDateString } from '../utils/easternDate';

export class RateLimitError extends Error {
  override message = RATE_LIMIT_MESSAGE;
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

const KEYS = {
  counters: '@tm/v1/counters',
  wall: '@tm/v1/wall',
} as const;

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

const seedWall = (): WallEntryRow[] => [
  {
    id: 'w1',
    displayName: 'Alex',
    location: 'Chicago, IL',
    totalWishes: 120,
    active: true,
    sortOrder: 0,
  },
  {
    id: 'w2',
    displayName: 'Jordan',
    location: 'Austin, TX',
    totalWishes: 89,
    active: true,
    sortOrder: 1,
  },
  {
    id: 'w3',
    displayName: 'Sam',
    location: 'Toronto, ON',
    totalWishes: 56,
    active: true,
    sortOrder: 2,
  },
];

type AppSnapshot = {
  counters: CounterStateRow;
  wall: WallEntryRow[];
};

let snapshot: AppSnapshot = {
  counters: defaultCounters(),
  wall: seedWall(),
};

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

function applyDailyReset(c: CounterStateRow): CounterStateRow {
  const today = getEasternDateString();
  if (c.lastResetDate === today) return c;
  return {
    ...c,
    goodThingsToday: 0,
    goodWishesToday: 0,
    lastResetDate: today,
  };
}

async function persist() {
  await AsyncStorage.multiSet([
    [KEYS.counters, JSON.stringify(snapshot.counters)],
    [KEYS.wall, JSON.stringify(snapshot.wall)],
  ]);
}

export function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function getSnapshot(): AppSnapshot {
  return snapshot;
}

export async function hydrate(): Promise<void> {
  const [[, cRaw], [, wRaw]] = await AsyncStorage.multiGet([KEYS.counters, KEYS.wall]);
  let counters = defaultCounters();
  let wall = seedWall();

  if (cRaw) {
    try {
      counters = applyDailyReset(JSON.parse(cRaw) as CounterStateRow);
    } catch {
      /* keep default */
    }
  } else {
    counters = applyDailyReset(counters);
  }

  if (wRaw) {
    try {
      wall = JSON.parse(wRaw) as WallEntryRow[];
    } catch {
      /* keep seed */
    }
  }

  snapshot = { counters: applyDailyReset(counters), wall };
  await persist();
  notify();
}

export async function refreshFromStorage(): Promise<void> {
  await hydrate();
}

async function guardedIncrement(mutate: (s: AppSnapshot) => void) {
  if (!(await tryConsumeClick())) {
    throw new RateLimitError();
  }
  snapshot = {
    counters: applyDailyReset({ ...snapshot.counters }),
    wall: snapshot.wall.map((w) => ({ ...w })),
  };
  mutate(snapshot);
  await persist();
  notify();
}

export async function incrementGoodThings() {
  await guardedIncrement((s) => {
    s.counters.goodThingsTotal += 1;
    s.counters.goodThingsToday += 1;
  });
}

export async function incrementGoodWishes() {
  await guardedIncrement((s) => {
    s.counters.goodWishesTotal += 1;
    s.counters.goodWishesToday += 1;
  });
}

export async function incrementWallPerson(personId: string) {
  if (!snapshot.wall.some((w) => w.id === personId)) {
    throw new Error('That entry is no longer on the wall.');
  }
  await guardedIncrement((s) => {
    const i = s.wall.findIndex((w) => w.id === personId);
    if (i >= 0) {
      s.wall[i] = { ...s.wall[i], totalWishes: s.wall[i].totalWishes + 1 };
    }
  });
}

export function getPublicWall(): WallEntryRow[] {
  return snapshot.wall
    .filter((w) => w.active)
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function adminSaveWallEntry(entry: WallEntryRow) {
  const wall = snapshot.wall.map((w) => ({ ...w }));
  const idx = wall.findIndex((w) => w.id === entry.id);
  if (idx >= 0) wall[idx] = entry;
  else wall.push(entry);
  snapshot = { counters: snapshot.counters, wall };
  await persist();
  notify();
}

export async function adminDeleteWallEntry(id: string) {
  snapshot = {
    counters: snapshot.counters,
    wall: snapshot.wall.filter((w) => w.id !== id),
  };
  await persist();
  notify();
}

export async function adminReorderWall(orderedIds: string[]) {
  const map = new Map(orderedIds.map((id, sortOrder) => [id, sortOrder]));
  const wall = snapshot.wall.map((w) => ({
    ...w,
    sortOrder: map.has(w.id) ? (map.get(w.id) as number) : w.sortOrder,
  }));
  snapshot = { counters: snapshot.counters, wall };
  await persist();
  notify();
}

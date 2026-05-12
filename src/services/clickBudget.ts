import AsyncStorage from '@react-native-async-storage/async-storage';
import { MAX_CLICKS_PER_DAY } from '../constants/config';
import { getEasternDateString } from '../utils/easternDate';

const KEY = '@tm/v1/device_clicks';

type Stored = { date: string; count: number };

/** In-memory copy of the device click budget — seeded from disk during hydrate so tap handlers stay sync/fast. */
let memory: Stored | null = null;

async function readFromDisk(): Promise<Stored> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return { date: getEasternDateString(), count: 0 };
  try {
    const v = JSON.parse(raw) as Stored;
    if (v.date !== getEasternDateString()) {
      return { date: getEasternDateString(), count: 0 };
    }
    return v;
  } catch {
    return { date: getEasternDateString(), count: 0 };
  }
}

async function writeToDisk(v: Stored) {
  await AsyncStorage.setItem(KEY, JSON.stringify(v));
}

/** Call during app hydrate so `tryConsumeClickSync` can run without awaiting AsyncStorage on each tap. */
export async function warmClickBudgetCache(): Promise<void> {
  memory = await readFromDisk();
}

/**
 * Atomically (in memory + async persist) consume one click if under the daily cap.
 * Returns false if the cache was never warmed or the cap is reached.
 */
export function tryConsumeClickSync(): boolean {
  const today = getEasternDateString();
  if (!memory) return false;
  if (memory.date !== today) {
    memory = { date: today, count: 0 };
  }
  if (memory.count >= MAX_CLICKS_PER_DAY) return false;
  memory = { ...memory, count: memory.count + 1 };
  void writeToDisk(memory);
  return true;
}

/** Roll back one in-memory/disk click after a failed Firestore write. */
export function undoConsumeClickSync(): void {
  if (!memory) return;
  const today = getEasternDateString();
  if (memory.date !== today || memory.count <= 0) return;
  memory = { ...memory, count: memory.count - 1 };
  void writeToDisk(memory);
}

/** Async path — warms cache then consumes; kept for any code that cannot preload. */
export async function tryConsumeClick(): Promise<boolean> {
  await warmClickBudgetCache();
  return tryConsumeClickSync();
}

export async function getClicksUsedToday(): Promise<number> {
  if (memory && memory.date === getEasternDateString()) {
    return memory.count;
  }
  const cur = await readFromDisk();
  return cur.count;
}

import AsyncStorage from '@react-native-async-storage/async-storage';
import { MAX_CLICKS_PER_DAY } from '../constants/config';
import { getEasternDateString } from '../utils/easternDate';

const KEY = '@tm/v1/device_clicks';

type Stored = { date: string; count: number };

async function read(): Promise<Stored> {
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

async function write(v: Stored) {
  await AsyncStorage.setItem(KEY, JSON.stringify(v));
}

/** Returns whether a click slot was consumed (under daily cap). */
export async function tryConsumeClick(): Promise<boolean> {
  const cur = await read();
  if (cur.count >= MAX_CLICKS_PER_DAY) return false;
  await write({ ...cur, count: cur.count + 1 });
  return true;
}

export async function getClicksUsedToday(): Promise<number> {
  const cur = await read();
  return cur.count;
}

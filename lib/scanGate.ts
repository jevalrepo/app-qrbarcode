import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@scan_gate';
const DAILY_LIMIT = 5;

interface GateData {
  count: number;
  date: string;
}

function today(): string {
  return new Date().toISOString().split('T')[0];
}

async function getData(): Promise<GateData> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return { count: 0, date: today() };
  const data = JSON.parse(raw) as GateData;
  if (data.date !== today()) return { count: 0, date: today() };
  return data;
}

export async function canScan(): Promise<boolean> {
  const data = await getData();
  return data.count < DAILY_LIMIT;
}

export async function incrementScanCount(): Promise<void> {
  const data = await getData();
  await AsyncStorage.setItem(KEY, JSON.stringify({ count: data.count + 1, date: today() }));
}

export async function resetScanCount(): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify({ count: 0, date: today() }));
}

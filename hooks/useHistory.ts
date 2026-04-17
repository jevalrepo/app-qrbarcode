import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QRType } from '@/lib/detectType';

// TODO [PRO]: Increase MAX_ITEMS to Infinity for Pro subscribers (paywall check here)
const MAX_ITEMS = 20;
const STORAGE_KEY = 'qrclean_history';

export interface HistoryItem {
  id: string;
  data: string;
  type: QRType;
  scannedAt: number;
}

export function useHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setHistory(JSON.parse(raw));
      })
      .finally(() => setLoading(false));
  }, []);

  const persist = useCallback(async (items: HistoryItem[]) => {
    setHistory(items);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, []);

  const addToHistory = useCallback(
    async (item: Omit<HistoryItem, 'id' | 'scannedAt'>) => {
      setHistory((prev) => {
        const withoutDupe = prev.filter((h) => h.data !== item.data);
        const next: HistoryItem[] = [
          { ...item, id: Date.now().toString(), scannedAt: Date.now() },
          ...withoutDupe,
        ].slice(0, MAX_ITEMS);
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    },
    [],
  );

  const removeFromHistory = useCallback(
    async (id: string) => {
      setHistory((prev) => {
        const next = prev.filter((h) => h.id !== id);
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    },
    [],
  );

  const clearHistory = useCallback(async () => {
    await persist([]);
  }, [persist]);

  return { history, loading, addToHistory, removeFromHistory, clearHistory };
}

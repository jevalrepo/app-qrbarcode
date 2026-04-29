import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QRType } from '@/lib/detectType';

// TODO [PRO]: Increase MAX_ITEMS to Infinity for Pro subscribers (paywall check here)
const MAX_ITEMS = 10;
const STORAGE_KEY = 'qrclean_history';

export interface HistoryItem {
  id: string;
  data: string;
  type: QRType;
  scannedAt: number;
  favorite?: boolean;
  alias?: string;
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
        const existing = prev.find((h) => h.data === item.data);
        const withoutDupe = prev.filter((h) => h.data !== item.data);
        const next: HistoryItem[] = [
          {
            ...item,
            id: Date.now().toString(),
            scannedAt: Date.now(),
            favorite: existing?.favorite ?? false,
          },
          ...withoutDupe,
        ].slice(0, MAX_ITEMS);
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    },
    [],
  );

  const removeFromHistory = useCallback(async (id: string) => {
    setHistory((prev) => {
      const next = prev.filter((h) => h.id !== id);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const toggleFavorite = useCallback(async (id: string) => {
    setHistory((prev) => {
      const next = prev.map((h) =>
        h.id === id ? { ...h, favorite: !h.favorite } : h,
      );
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const renameItem = useCallback(async (id: string, alias: string) => {
    setHistory((prev) => {
      const next = prev.map((h) =>
        h.id === id ? { ...h, alias: alias.trim() || undefined } : h,
      );
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  // clearHistory preserves favorites
  const clearHistory = useCallback(async () => {
    setHistory((prev) => {
      const kept = prev.filter((h) => h.favorite);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(kept));
      return kept;
    });
  }, []);

  const reload = useCallback(async () => {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    setHistory(raw ? JSON.parse(raw) : []);
  }, []);

  return { history, loading, addToHistory, removeFromHistory, toggleFavorite, renameItem, clearHistory, reload };
}

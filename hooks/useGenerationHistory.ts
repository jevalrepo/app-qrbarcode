import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QRType } from '@/lib/detectType';

const MAX_ITEMS = 10;
const STORAGE_KEY = 'qrclean_generations';

export interface GenerationItem {
  id: string;
  data: string;
  type: QRType;
  scannedAt: number;
  favorite?: boolean;
  alias?: string;
}

export function useGenerationHistory() {
  const [generations, setGenerations] = useState<GenerationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setGenerations(JSON.parse(raw));
      })
      .finally(() => setLoading(false));
  }, []);

  const addToGenerationHistory = useCallback(
    async (item: Omit<GenerationItem, 'id' | 'scannedAt'>) => {
      setGenerations((prev) => {
        const existing = prev.find((g) => g.data === item.data);
        const withoutDupe = prev.filter((g) => g.data !== item.data);
        const next: GenerationItem[] = [
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

  const removeFromGenerationHistory = useCallback(async (id: string) => {
    setGenerations((prev) => {
      const next = prev.filter((g) => g.id !== id);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const toggleGenerationFavorite = useCallback(async (id: string) => {
    setGenerations((prev) => {
      const next = prev.map((g) =>
        g.id === id ? { ...g, favorite: !g.favorite } : g,
      );
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const renameGenerationItem = useCallback(async (id: string, alias: string) => {
    setGenerations((prev) => {
      const next = prev.map((g) =>
        g.id === id ? { ...g, alias: alias.trim() || undefined } : g,
      );
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clearGenerationHistory = useCallback(async () => {
    setGenerations((prev) => {
      const kept = prev.filter((g) => g.favorite);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(kept));
      return kept;
    });
  }, []);

  const reload = useCallback(async () => {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    setGenerations(raw ? JSON.parse(raw) : []);
  }, []);

  return {
    generations,
    loading,
    addToGenerationHistory,
    removeFromGenerationHistory,
    toggleGenerationFavorite,
    renameGenerationItem,
    clearGenerationHistory,
    reload,
  };
}

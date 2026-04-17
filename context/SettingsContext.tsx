import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';
import { Language, translations } from '@/lib/i18n';
import { DEFAULT_ACCENT } from '@/lib/accent';

export type ThemePreference = 'light' | 'dark' | 'auto';

export interface Settings {
  theme: ThemePreference;
  autoOpenUrls: boolean;
  language: Language;
  accentColor: string;
}

const DEFAULT: Settings = {
  theme: 'auto',
  autoOpenUrls: false,
  language: 'es',
  accentColor: DEFAULT_ACCENT,
};

const STORAGE_KEY = 'qrclean_settings';

const SettingsContext = createContext<{
  settings: Settings;
  updateSettings: (partial: Partial<Settings>) => void;
}>({ settings: DEFAULT, updateSettings: () => {} });

function applyTheme(theme: ThemePreference) {
  Appearance.setColorScheme(theme === 'auto' ? null : theme);
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (!raw) return;
      const saved: Settings = { ...DEFAULT, ...JSON.parse(raw) };
      setSettings(saved);
      applyTheme(saved.theme);
    });
  }, []);

  const updateSettings = useCallback((partial: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      if (partial.theme !== undefined) applyTheme(partial.theme);
      return next;
    });
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useAppSettings = () => useContext(SettingsContext);

/** Devuelve el color de acento activo */
export const useAccent = () => useContext(SettingsContext).settings.accentColor;

/** Devuelve las traducciones del idioma activo */
export function useT() {
  const { settings } = useAppSettings();
  return translations[settings.language] ?? translations.es;
}

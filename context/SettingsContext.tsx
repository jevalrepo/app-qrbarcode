import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance, Platform } from 'react-native';
import { Language, translations } from '@/lib/i18n';
import { DEFAULT_ACCENT } from '@/lib/accent';

export type ThemePreference = 'light' | 'dark' | 'auto';

export interface Settings {
  theme: ThemePreference;
  autoOpenUrls: boolean;
  haptics: boolean;
  language: Language;
  accentColor: string;
  isPro: boolean;
}

const DEFAULT: Settings = {
  theme: 'auto',
  autoOpenUrls: false,
  haptics: true,
  language: 'es',
  accentColor: DEFAULT_ACCENT,
  isPro: false,
};

const STORAGE_KEY = 'qrclean_settings';
const FALLBACK_THEME = 'light';

const SettingsContext = createContext<{
  settings: Settings;
  resolvedTheme: 'light' | 'dark';
  updateSettings: (partial: Partial<Settings>) => void;
}>({ settings: DEFAULT, resolvedTheme: FALLBACK_THEME, updateSettings: () => {} });

function getSystemTheme() {
  return Appearance.getColorScheme() ?? FALLBACK_THEME;
}

function resolveTheme(theme: ThemePreference, systemTheme: 'light' | 'dark') {
  return theme === 'auto' ? systemTheme : theme;
}

function applyTheme(theme: ThemePreference, systemTheme: 'light' | 'dark') {
  const resolvedTheme = resolveTheme(theme, systemTheme);

  if (Platform.OS !== 'web' && typeof Appearance.setColorScheme === 'function') {
    Appearance.setColorScheme(theme === 'auto' ? null : theme);
  }

  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    document.documentElement.dataset.theme = resolvedTheme;
    document.documentElement.style.colorScheme = resolvedTheme;
    document.body?.setAttribute('data-theme', resolvedTheme);
  }

  return resolvedTheme;
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT);
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(getSystemTheme);
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(
    resolveTheme(DEFAULT.theme, getSystemTheme()),
  );

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (!raw) return;
      const saved: Settings = { ...DEFAULT, ...JSON.parse(raw) };
      setSettings(saved);
    });
  }, []);

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemTheme(colorScheme ?? FALLBACK_THEME);
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    setResolvedTheme(applyTheme(settings.theme, systemTheme));
  }, [settings.theme, systemTheme]);

  const updateSettings = useCallback((partial: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, resolvedTheme, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useAppSettings = () => useContext(SettingsContext);
export const useThemeScheme = () => useContext(SettingsContext).resolvedTheme;

/** Devuelve el color de acento activo */
export const useAccent = () => useContext(SettingsContext).settings.accentColor;

/** Devuelve las traducciones del idioma activo */
export function useT() {
  const { settings } = useAppSettings();
  return translations[settings.language] ?? translations.es;
}

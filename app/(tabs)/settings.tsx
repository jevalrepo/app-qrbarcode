import React from 'react';
import { View, Text, Switch, TouchableOpacity, ScrollView, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppSettings, useT, useAccent, ThemePreference } from '@/context/SettingsContext';
import { Language, LANGUAGE_LABELS } from '@/lib/i18n';
import { ACCENT_COLORS } from '@/lib/accent';

type ThemeOption = { id: ThemePreference; labelKey: 'themeLight' | 'themeDark' | 'themeAuto' };

const THEME_OPTIONS: ThemeOption[] = [
  { id: 'light', labelKey: 'themeLight' },
  { id: 'dark',  labelKey: 'themeDark'  },
  { id: 'auto',  labelKey: 'themeAuto'  },
];

const LANGUAGES: Language[] = ['es', 'en'];

function SectionLabel({ children }: { children: string }) {
  return (
    <Text className="text-xs font-medium uppercase tracking-widest px-1 mb-2" style={{ color: '#888780' }}>
      {children}
    </Text>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const { settings, updateSettings } = useAppSettings();
  const t = useT();
  const s = t.settings;
  const accent = useAccent();

  const bg          = isDark ? '#0A0A0A' : '#FFFFFF';
  const bgSecondary = isDark ? '#141414' : '#F5F5F3';
  const bgTertiary  = isDark ? '#1E1E1E' : '#EBEBEA';
  const border      = isDark ? '#2A2A2A' : '#E8E8E6';
  const text        = isDark ? '#F5F5F3' : '#0A0A0A';
  const textSecondary = '#888780';

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: bg }}
      contentContainerStyle={{ paddingTop: insets.top + 22, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* ── APARIENCIA ── */}
      <View className="px-5 mb-6">
        <SectionLabel>{s.appearance}</SectionLabel>
        <View
          className="rounded-2xl p-4"
          style={{ backgroundColor: bgSecondary, borderWidth: 0.5, borderColor: border }}
        >
          {/* tema */}
          <Text className="text-sm font-medium mb-3" style={{ color: text }}>{s.theme}</Text>
          <View className="flex-row gap-2 mb-5">
            {THEME_OPTIONS.map((opt) => {
              const active = settings.theme === opt.id;
              return (
                <TouchableOpacity
                  key={opt.id}
                  onPress={() => updateSettings({ theme: opt.id })}
                  className="flex-1 py-2.5 rounded-xl items-center"
                  style={{
                    backgroundColor: active ? accent : bgTertiary,
                    borderWidth: 0.5,
                    borderColor: active ? accent : border,
                  }}
                  activeOpacity={0.7}
                >
                  <Text className="text-sm font-medium" style={{ color: active ? 'white' : textSecondary }}>
                    {s[opt.labelKey]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View className="h-px mb-4" style={{ backgroundColor: border }} />

          {/* idioma */}
          <Text className="text-sm font-medium mb-3" style={{ color: text }}>{s.language}</Text>
          <View className="flex-row gap-2 mb-5">
            {LANGUAGES.map((lang) => {
              const active = settings.language === lang;
              return (
                <TouchableOpacity
                  key={lang}
                  onPress={() => updateSettings({ language: lang })}
                  className="flex-1 py-2.5 rounded-xl items-center"
                  style={{
                    backgroundColor: active ? accent : bgTertiary,
                    borderWidth: 0.5,
                    borderColor: active ? accent : border,
                  }}
                  activeOpacity={0.7}
                >
                  <Text className="text-sm font-medium" style={{ color: active ? 'white' : textSecondary }}>
                    {LANGUAGE_LABELS[lang]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View className="h-px mb-4" style={{ backgroundColor: border }} />

          {/* color de acento */}
          <Text className="text-sm font-medium mb-4" style={{ color: text }}>{s.accentColor}</Text>
          <View className="flex-row flex-wrap gap-3">
            {ACCENT_COLORS.map((c) => {
              const active = settings.accentColor === c.value;
              const colorLabel = s.accentColors[c.id as keyof typeof s.accentColors] ?? c.id;
              return (
                <TouchableOpacity
                  key={c.id}
                  onPress={() => updateSettings({ accentColor: c.value })}
                  activeOpacity={0.8}
                  style={{ alignItems: 'center' }}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      position: 'relative',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Ionicons name="ellipse" size={40} color={c.value} />
                    {active && (
                      <View
                        style={{
                          position: 'absolute',
                          width: 18,
                          height: 18,
                          borderRadius: 9,
                          backgroundColor: isDark ? '#FFFFFF' : '#0A0A0A',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Ionicons name="checkmark" size={12} color={isDark ? '#0A0A0A' : '#FFFFFF'} />
                      </View>
                    )}
                  </View>
                  <Text style={{ fontSize: 10, color: textSecondary, marginTop: 6 }}>{colorLabel}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>

      {/* ── COMPORTAMIENTO ── */}
      <View className="px-5 mb-6">
        <SectionLabel>{s.behavior}</SectionLabel>
        <View
          className="rounded-2xl"
          style={{ backgroundColor: bgSecondary, borderWidth: 0.5, borderColor: border }}
        >
          <View className="flex-row items-center px-4 py-4">
            <View className="flex-1 mr-4">
              <Text className="text-sm font-medium" style={{ color: text }}>{s.autoOpen}</Text>
              <Text className="text-xs mt-0.5" style={{ color: textSecondary }}>{s.autoOpenDesc}</Text>
            </View>
            <Switch
              value={settings.autoOpenUrls}
              onValueChange={(val) => updateSettings({ autoOpenUrls: val })}
              trackColor={{ false: isDark ? '#2A2A2A' : '#EBEBEA', true: accent }}
              thumbColor="white"
            />
          </View>
        </View>
      </View>

      {/* ── ACERCA DE ── */}
      <View className="px-5">
        <SectionLabel>{s.about}</SectionLabel>
        <View
          className="rounded-2xl overflow-hidden"
          style={{ backgroundColor: bgSecondary, borderWidth: 0.5, borderColor: border }}
        >
          <View className="flex-row items-center justify-between px-4 py-4">
            <Text className="text-sm" style={{ color: text }}>{s.version}</Text>
            <Text className="text-sm" style={{ color: textSecondary }}>1.0.0</Text>
          </View>
          <View className="h-px mx-4" style={{ backgroundColor: border }} />
          <View className="flex-row items-center justify-between px-4 py-4">
            <Text className="text-sm" style={{ color: text }}>{s.slogan}</Text>
            <Text className="text-sm font-medium" style={{ color: accent }}>QR & Barcode Scanner</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

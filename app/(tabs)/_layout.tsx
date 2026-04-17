import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useT, useAccent, useThemeScheme } from '@/context/SettingsContext';

type IoniconsName = keyof typeof Ionicons.glyphMap;

function TabIcon({
  name, focused, isDark, accent,
}: {
  name: IoniconsName; focused: boolean; isDark: boolean; accent: string;
}) {
  if (!focused) return <Ionicons name={name} size={22} color={isDark ? '#888780' : '#6B6B6A'} />;
  return (
    <View
      className="w-10 h-10 rounded-2xl items-center justify-center"
      style={{ backgroundColor: accent + '22' }}
    >
      <Ionicons name={name} size={22} color={accent} />
    </View>
  );
}

export default function TabLayout() {
  const scheme = useThemeScheme();
  const isDark = scheme === 'dark';
  const t = useT();
  const accent = useAccent();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: accent,
        tabBarInactiveTintColor: isDark ? '#888780' : '#6B6B6A',
        tabBarStyle: {
          backgroundColor: isDark ? '#0A0A0A' : '#FFFFFF',
          borderTopWidth: 0.5,
          borderTopColor: isDark ? '#2A2A2A' : '#E8E8E6',
          height: 80,
          paddingBottom: 16,
          paddingTop: 8,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500', marginTop: 2 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t.tabs.home,
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? 'home' : 'home-outline'} focused={focused} isDark={isDark} accent={accent} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: t.tabs.history,
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? 'time' : 'time-outline'} focused={focused} isDark={isDark} accent={accent} />
          ),
        }}
      />
      <Tabs.Screen
        name="generate"
        options={{
          title: t.tabs.generate,
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? 'qr-code' : 'qr-code-outline'} focused={focused} isDark={isDark} accent={accent} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t.tabs.settings,
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? 'settings' : 'settings-outline'} focused={focused} isDark={isDark} accent={accent} />
          ),
        }}
      />
    </Tabs>
  );
}

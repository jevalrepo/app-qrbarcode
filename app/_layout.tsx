import '../global.css';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { SettingsProvider, useThemeScheme } from '@/context/SettingsContext';
import { initializeAds } from '@/lib/initAds';
import { useRevenueCat } from '@/hooks/useRevenueCat';

void SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  useRevenueCat();
  const scheme = useThemeScheme();
  const [minimumTimeElapsed, setMinimumTimeElapsed] = useState(false);
  const [layoutReady, setLayoutReady] = useState(false);

  useEffect(() => {
    initializeAds();

    const timer = setTimeout(() => {
      setMinimumTimeElapsed(true);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!minimumTimeElapsed || !layoutReady) return;

    void SplashScreen.hideAsync();
  }, [layoutReady, minimumTimeElapsed]);

  const isDark = scheme === 'dark';
  const bg = isDark ? '#0A0A0A' : '#FFFFFF';

  return (
    <View
      style={{ flex: 1 }}
      onLayout={() => {
        setLayoutReady(true);
      }}
    >
      <SafeAreaProvider>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: bg },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="scanner"
            options={{
              presentation: 'fullScreenModal',
              animation: 'fade',
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="result"
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="help"
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="privacy"
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
              headerShown: false,
            }}
          />
        </Stack>
      </SafeAreaProvider>
    </View>
  );
}

export default function RootLayout() {
  return (
    <SettingsProvider>
      <RootNavigator />
    </SettingsProvider>
  );
}

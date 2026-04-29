import '../global.css';
import { useEffect, useRef } from 'react';
import { View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { SettingsProvider, useThemeScheme, useAppSettings } from '@/context/SettingsContext';
import { initializeAds } from '@/lib/initAds';
import { useRevenueCat } from '@/hooks/useRevenueCat';

void SplashScreen.hideAsync();

function RootNavigator() {
  useRevenueCat();
  const scheme = useThemeScheme();
  const { settings, settingsLoaded } = useAppSettings();
  const router = useRouter();
  const hasOpenedScanner = useRef(false);

  useEffect(() => {
    initializeAds();
  }, []);

  useEffect(() => {
    if (settingsLoaded && settings.autoOpenScanner && !hasOpenedScanner.current) {
      hasOpenedScanner.current = true;
      router.push('/scanner');
    }
  }, [settingsLoaded]);

  const isDark = scheme === 'dark';
  const bg = isDark ? '#0A0A0A' : '#FFFFFF';

  return (
    <View style={{ flex: 1 }}>
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

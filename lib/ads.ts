import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Cambia a true solo cuando vayas a publicar en Play Store
const USE_PRODUCTION_ADS = false;

const TEST_IDS = {
  banner: Platform.select({
    android: 'ca-app-pub-3940256099942544/6300978111',
    ios: 'ca-app-pub-3940256099942544/2934735716',
  }) as string,
  interstitial: Platform.select({
    android: 'ca-app-pub-3940256099942544/1033173712',
    ios: 'ca-app-pub-3940256099942544/4411468910',
  }) as string,
  rewardedInterstitial: Platform.select({
    android: 'ca-app-pub-3940256099942544/5354046379',
    ios: 'ca-app-pub-3940256099942544/6978759866',
  }) as string,
};

const PRODUCTION_IDS = {
  banner: Platform.select({
    android: 'ca-app-pub-8093662880798686/3461398748',
    ios: '',
  }) as string,
  interstitial: Platform.select({
    android: 'ca-app-pub-8093662880798686/3269827052',
    ios: '',
  }) as string,
  rewardedInterstitial: Platform.select({
    android: '',
    ios: '',
  }) as string,
};

export const AD_UNITS = USE_PRODUCTION_ADS ? PRODUCTION_IDS : TEST_IDS;

const SCAN_COUNT_KEY = '@scan_count';
const INTERSTITIAL_EVERY = 5;

export async function incrementScanCount(): Promise<number> {
  const raw = await AsyncStorage.getItem(SCAN_COUNT_KEY);
  const count = (parseInt(raw ?? '0', 10) || 0) + 1;
  await AsyncStorage.setItem(SCAN_COUNT_KEY, String(count));
  return count;
}

export async function shouldShowInterstitial(): Promise<boolean> {
  const raw = await AsyncStorage.getItem(SCAN_COUNT_KEY);
  const count = parseInt(raw ?? '0', 10) || 0;
  return count > 0 && count % INTERSTITIAL_EVERY === 0;
}

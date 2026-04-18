import { TurboModuleRegistry } from 'react-native';

export function initializeAds() {
  if (!TurboModuleRegistry.get('RNGoogleMobileAdsModule')) return;
  const mobileAds = require('react-native-google-mobile-ads').default;
  mobileAds().initialize();
}

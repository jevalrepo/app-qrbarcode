import React from 'react';
import { View, TurboModuleRegistry } from 'react-native';
import { AD_UNITS } from '@/lib/ads';
import { useAppSettings } from '@/context/SettingsContext';

const adsAvailable = !!TurboModuleRegistry.get('RNGoogleMobileAdsModule');

let BannerAd: any = null;
let BannerAdSize: any = null;
if (adsAvailable) {
  const ads = require('react-native-google-mobile-ads');
  BannerAd = ads.BannerAd;
  BannerAdSize = ads.BannerAdSize;
}

export default function BannerAdView() {
  const { settings } = useAppSettings();
  if (!BannerAd || !BannerAdSize || settings.isPro) return null;
  return (
    <View style={{ alignItems: 'center', width: '100%' }}>
      <BannerAd
        unitId={AD_UNITS.banner}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: false }}
      />
    </View>
  );
}

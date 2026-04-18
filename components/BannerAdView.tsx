import React from 'react';
import { View, TurboModuleRegistry } from 'react-native';
import { AD_UNITS } from '@/lib/ads';

const adsAvailable = !!TurboModuleRegistry.get('RNGoogleMobileAdsModule');

let BannerAd: any = null;
let BannerAdSize: any = null;
if (adsAvailable) {
  const ads = require('react-native-google-mobile-ads');
  BannerAd = ads.BannerAd;
  BannerAdSize = ads.BannerAdSize;
}

export default function BannerAdView() {
  if (!BannerAd || !BannerAdSize) return null;
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

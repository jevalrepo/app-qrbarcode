import { useEffect, useRef } from 'react';
import { TurboModuleRegistry } from 'react-native';
import { AD_UNITS, incrementScanCount, shouldShowInterstitial } from '@/lib/ads';

const adsAvailable = !!TurboModuleRegistry.get('RNGoogleMobileAdsModule');

let interstitial: any = null;
let AdEventType: any = null;
if (adsAvailable) {
  const ads = require('react-native-google-mobile-ads');
  AdEventType = ads.AdEventType;
  interstitial = ads.InterstitialAd.createForAdRequest(AD_UNITS.interstitial);
}

export function useInterstitialAd() {
  const adLoaded = useRef(false);

  useEffect(() => {
    if (!interstitial || !AdEventType) return;

    const pendingShow = { value: false };

    const unsubscribe = interstitial.addAdEventListener(AdEventType.LOADED, () => {
      adLoaded.current = true;
      if (pendingShow.value) {
        interstitial.show();
        pendingShow.value = false;
      }
    });

    interstitial.load();

    incrementScanCount().then(async () => {
      const show = await shouldShowInterstitial();
      if (show) {
        if (adLoaded.current) {
          interstitial.show();
        } else {
          pendingShow.value = true;
        }
      }
    });

    return () => unsubscribe();
  }, []);
}

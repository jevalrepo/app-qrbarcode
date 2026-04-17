import { useEffect, useRef } from 'react';
import { InterstitialAd, AdEventType } from 'react-native-google-mobile-ads';
import { AD_UNITS, incrementScanCount, shouldShowInterstitial } from '@/lib/ads';

const interstitial = InterstitialAd.createForAdRequest(AD_UNITS.interstitial);

export function useInterstitialAd() {
  const adLoaded = useRef(false);

  useEffect(() => {
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

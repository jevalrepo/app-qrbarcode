import { useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import Purchases, { LOG_LEVEL, CustomerInfo } from 'react-native-purchases';
import { useAppSettings } from '@/context/SettingsContext';

export const RC_ENTITLEMENT = 'QR & BARCODE SCANNER Pro';

const RC_API_KEY = Platform.select({
  ios: 'REPLACE_IOS_KEY_HERE',
  default: 'test_KxtxUkNtJOfrnDvsRlpSdTrmlpv',
})!;

export function useRevenueCat() {
  const { updateSettings } = useAppSettings();

  const syncCustomerInfo = useCallback((info: CustomerInfo) => {
    const isPro = !!info.entitlements.active[RC_ENTITLEMENT];
    updateSettings({ isPro });
  }, [updateSettings]);

  useEffect(() => {
    try {
      Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.DEBUG : LOG_LEVEL.ERROR);
      Purchases.configure({ apiKey: RC_API_KEY });
      Purchases.getCustomerInfo().then(syncCustomerInfo).catch(() => {});
      const unsub = Purchases.addCustomerInfoUpdateListener(syncCustomerInfo);
      return () => unsub.remove();
    } catch (e) {
      console.error('[RC] init error:', e);
    }
  }, [syncCustomerInfo]);
}

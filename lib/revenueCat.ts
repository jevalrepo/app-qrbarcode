import { Alert } from 'react-native';
import Purchases from 'react-native-purchases';
import RevenueCatUI from 'react-native-purchases-ui';
import { RC_ENTITLEMENT } from '@/hooks/useRevenueCat';

export async function presentPaywall(): Promise<void> {
  try {
    await RevenueCatUI.presentPaywallIfNeeded({
      requiredEntitlementIdentifier: RC_ENTITLEMENT,
    });
  } catch (e) {
    console.error('[RC] paywall error:', e);
  }
}

export async function restorePurchases(
  successMsg: string,
  notFoundMsg: string,
): Promise<void> {
  try {
    const info = await Purchases.restorePurchases();
    const isPro = !!info.entitlements.active[RC_ENTITLEMENT];
    Alert.alert('', isPro ? successMsg : notFoundMsg);
  } catch (e) {
    console.error('[RC] restore error:', e);
  }
}

export async function presentCustomerCenter(): Promise<void> {
  try {
    await RevenueCatUI.presentCustomerCenter();
  } catch (e) {
    console.error('[RC] customer center error:', e);
  }
}

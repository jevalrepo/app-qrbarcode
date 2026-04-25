import { Alert } from 'react-native';
import { RC_ENTITLEMENT } from '@/hooks/useRevenueCat';

let Purchases: any = null;
let RevenueCatUI: any = null;
try {
  Purchases = require('react-native-purchases').default;
  RevenueCatUI = require('react-native-purchases-ui').default;
} catch {}

export async function presentPaywall(): Promise<void> {
  if (!RevenueCatUI) return;
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
  if (!Purchases) return;
  try {
    const info = await Purchases.restorePurchases();
    const isPro = !!info.entitlements.active[RC_ENTITLEMENT];
    Alert.alert('', isPro ? successMsg : notFoundMsg);
  } catch (e) {
    console.error('[RC] restore error:', e);
  }
}

export async function presentCustomerCenter(): Promise<void> {
  if (!RevenueCatUI) return;
  try {
    await RevenueCatUI.presentCustomerCenter();
  } catch (e) {
    console.error('[RC] customer center error:', e);
  }
}

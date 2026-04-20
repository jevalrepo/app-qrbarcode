import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useT, useAccent, useThemeScheme } from '@/context/SettingsContext';
import { resetScanCount } from '@/lib/scanGate';
import { AD_UNITS } from '@/lib/ads';
import { TurboModuleRegistry } from 'react-native';

let RewardedInterstitialAd: any = null;
let RewardedAdEventType: any = null;
if (!!TurboModuleRegistry.get('RNGoogleMobileAdsModule')) {
  const ads = require('react-native-google-mobile-ads');
  RewardedInterstitialAd = ads.RewardedInterstitialAd;
  RewardedAdEventType = ads.RewardedAdEventType;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onRewarded: () => void;
}

export default function ScanLimitModal({ visible, onClose, onRewarded }: Props) {
  const scheme = useThemeScheme();
  const isDark = scheme === 'dark';
  const t = useT();
  const s = t.scanLimit;
  const accent = useAccent();
  const [adReady, setAdReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const rewardedRef = useRef<any>(null);

  const bg = isDark ? '#141414' : '#FFFFFF';
  const bgSecondary = isDark ? '#1E1E1E' : '#F5F5F3';
  const border = isDark ? '#2A2A2A' : '#E8E8E6';
  const text = isDark ? '#F5F5F3' : '#0A0A0A';
  const textSecondary = '#888780';

  useEffect(() => {
    if (!visible || !RewardedInterstitialAd || !RewardedAdEventType) return;

    setAdReady(false);
    setLoading(true);

    const ad = RewardedInterstitialAd.createForAdRequest(AD_UNITS.rewardedInterstitial);
    rewardedRef.current = ad;

    const unsubLoaded = ad.addAdEventListener(RewardedAdEventType.LOADED, () => {
      setAdReady(true);
      setLoading(false);
    });

    const unsubReward = ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, async () => {
      await resetScanCount();
      onRewarded();
    });

    ad.load();

    return () => {
      unsubLoaded();
      unsubReward();
    };
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{
        flex: 1, backgroundColor: 'rgba(0,0,0,0.65)',
        alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20,
      }}>
        <View style={{
          width: '100%', backgroundColor: bg, borderRadius: 32,
          overflow: 'hidden', borderWidth: 0.5, borderColor: border,
        }}>
          {/* Header */}
          <View style={{
            backgroundColor: accent + '14', paddingTop: 36, paddingBottom: 28,
            alignItems: 'center', paddingHorizontal: 24,
          }}>
            <View style={{
              width: 64, height: 64, borderRadius: 20,
              backgroundColor: accent + '22', alignItems: 'center',
              justifyContent: 'center', marginBottom: 16,
            }}>
              <Ionicons name="scan-outline" size={32} color={accent} />
            </View>
            <Text style={{ color: text, fontSize: 20, fontWeight: '700', textAlign: 'center', marginBottom: 8 }}>
              {s.title}
            </Text>
            <Text style={{ color: textSecondary, fontSize: 14, lineHeight: 21, textAlign: 'center' }}>
              {s.message}
            </Text>
          </View>

          {/* Buttons */}
          <View style={{ padding: 20, gap: 10 }}>
            {/* Ver anuncio */}
            <TouchableOpacity
              onPress={() => rewardedRef.current?.show()}
              disabled={!adReady}
              activeOpacity={0.85}
              style={{
                backgroundColor: adReady ? accent : bgSecondary,
                borderRadius: 18, paddingVertical: 16,
                flexDirection: 'row', alignItems: 'center',
                justifyContent: 'center', gap: 8,
              }}
            >
              {loading ? (
                <ActivityIndicator size="small" color={textSecondary} />
              ) : (
                <Ionicons name="play-circle" size={22} color={adReady ? 'white' : textSecondary} />
              )}
              <Text style={{
                color: adReady ? 'white' : textSecondary,
                fontWeight: '600', fontSize: 16,
              }}>
                {loading ? s.adLoading : s.watchAd}
              </Text>
            </TouchableOpacity>

            {/* Hacerse PRO */}
            <TouchableOpacity
              onPress={() => {}}
              activeOpacity={0.85}
              style={{
                backgroundColor: bgSecondary, borderRadius: 18, paddingVertical: 16,
                flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                gap: 8, borderWidth: 0.5, borderColor: border,
              }}
            >
              <Ionicons name="star" size={20} color="#EF9F27" />
              <Text style={{ color: text, fontWeight: '600', fontSize: 16 }}>{s.goPro}</Text>
            </TouchableOpacity>

            {/* Cerrar */}
            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.6}
              style={{ paddingVertical: 12, alignItems: 'center' }}
            >
              <Text style={{ color: textSecondary, fontSize: 15 }}>{s.close}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

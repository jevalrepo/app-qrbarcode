import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, Linking, Alert, TurboModuleRegistry, Platform,
} from 'react-native';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';

import { useLocalSearchParams, useRouter } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppSettings, useT, useAccent, useThemeScheme } from '@/context/SettingsContext';
import { QRType, getTypeLabel, getTypeIcon, getTypeColor, parseWifi } from '@/lib/detectType';
import { AD_UNITS } from '@/lib/ads';

const adsAvailable = !!TurboModuleRegistry.get('RNGoogleMobileAdsModule');
let BannerAd: any = null;
let BannerAdSize: any = null;
if (adsAvailable) {
  const ads = require('react-native-google-mobile-ads');
  BannerAd = ads.BannerAd;
  BannerAdSize = ads.BannerAdSize;
}

export default function ResultScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data, type, source } = useLocalSearchParams<{ data: string; type: string; source?: string }>();
  const scheme = useThemeScheme();
  const isDark = scheme === 'dark';
  const [copied, setCopied] = useState(false);
  const svgRef = useRef<{ toDataURL: (cb: (data: string) => void) => void } | null>(null);
  const shareFrameRef = useRef<View>(null);
  const { settings } = useAppSettings();
  const t = useT();
  const r = t.result;
  const accent = useAccent();

  const qrType = (type as QRType) ?? 'text';
  const color = getTypeColor(qrType, accent);
  const icon = getTypeIcon(qrType) as keyof typeof Ionicons.glyphMap;
  const label = getTypeLabel(qrType);

  useEffect(() => {
    if (settings.autoOpenUrls && qrType === 'url' && data && source !== 'history') {
      Linking.openURL(data.startsWith('http') ? data : `https://${data}`).catch(() => {});
    }
  }, []);

  const bg = isDark ? '#0A0A0A' : '#FFFFFF';
  const bgSecondary = isDark ? '#141414' : '#F5F5F3';
  const border = isDark ? '#2A2A2A' : '#E8E8E6';
  const text = isDark ? '#F5F5F3' : '#0A0A0A';
  const textSecondary = '#888780';

  async function handleCopy() {
    await Clipboard.setStringAsync(data ?? '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleShareImage() {
    if (!shareFrameRef.current) return;
    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      const uri = await captureRef(shareFrameRef, { format: 'png', quality: 1 });
      await Sharing.shareAsync(uri, { mimeType: 'image/png', UTI: 'public.png' });
    } catch (e) {
      console.error('[ShareImage]', e);
      Alert.alert('Error', r.shareError ?? '');
    }
  }

  async function handleAddContact() {
    if (!data) return;
    try {
      const path = `${FileSystem.cacheDirectory}contact_${Date.now()}.vcf`;
      await FileSystem.writeAsStringAsync(path, data);
      if (Platform.OS === 'android') {
        const contentUri = await FileSystem.getContentUriAsync(path);
        await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
          data: contentUri,
          type: 'text/vcard',
          flags: 1,
        });
      } else {
        await Sharing.shareAsync(path, { mimeType: 'text/vcard', UTI: 'public.vcard' });
      }
    } catch (e) {
      console.error('[AddContact]', e);
      Alert.alert('', r.contactError);
    }
  }

  async function handleSmartAction() {
    if (!data) return;
    switch (qrType) {
      case 'url':
        await Linking.openURL(data.startsWith('http') ? data : `https://${data}`);
        break;
      case 'email':
        await Linking.openURL(`mailto:${data.replace(/^mailto:/i, '')}`);
        break;
      case 'phone':
        await Linking.openURL(`tel:${data.replace(/^tel:/i, '')}`);
        break;
      case 'wifi': {
        const { ssid, password, security } = parseWifi(data);
        const secLabel = security === 'WPA' ? r.wifiSecurityWPA
          : security === 'WEP' ? r.wifiSecurityWEP
          : r.wifiOpen;
        const msg = `${r.wifiSsid}: ${ssid}\n${r.wifiSecurityLabel}: ${secLabel}${password ? `\n${r.copyPassword.replace(/copiar\s*/i, '').replace(/copy\s*/i, '').trim()}: ${password}` : ''}`;
        Alert.alert(r.wifiTitle, msg, [
          ...(password ? [{ text: r.copyPassword, onPress: () => Clipboard.setStringAsync(password) }] : []),
          { text: 'OK' },
        ]);
        break;
      }
      case 'geo': {
        const coords = data.replace(/^geo:/i, '');
        await Linking.openURL(`maps:${coords}`).catch(() =>
          Linking.openURL(`https://maps.google.com/?q=${coords}`),
        );
        break;
      }
      case 'sms':
        await Linking.openURL(`sms:${data.replace(/^smsto?:/i, '').split(':')[0]}`);
        break;
      case 'vcard':
        await handleAddContact();
        break;
      case 'product':
        await Linking.openURL(`https://www.google.com/search?q=${encodeURIComponent(data)}`);
        break;
      default:
        handleCopy();
    }
  }

  function getSmartActionLabel(): string {
    switch (qrType) {
      case 'url': return r.openUrl;
      case 'email': return r.sendEmail;
      case 'phone': return r.call;
      case 'wifi': return r.seePassword;
      case 'geo': return r.openMaps;
      case 'sms': return r.sendSMS;
      case 'vcard': return r.addContact;
      case 'product': return r.searchProduct;
      default: return r.copy;
    }
  }

  function getSmartActionIcon(): keyof typeof Ionicons.glyphMap {
    switch (qrType) {
      case 'url': return 'open-outline';
      case 'email': return 'send-outline';
      case 'phone': return 'call-outline';
      case 'wifi': return 'wifi-outline';
      case 'geo': return 'map-outline';
      case 'sms': return 'chatbubble-outline';
      case 'vcard': return 'person-add-outline';
      case 'product': return 'search-outline';
      default: return 'copy-outline';
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <View style={{ paddingTop: insets.top + 8 }} className="items-center pb-1">
        <View className="w-10 h-1 rounded-full" style={{ backgroundColor: border }} />
      </View>

      <View
        className="flex-row items-center justify-between px-5 py-3"
        style={{ borderBottomWidth: 0.5, borderBottomColor: border }}
      >
        <View style={{ width: 36 }} />
        <Text className="text-base font-medium" style={{ color: text }}>{r.title}</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-9 h-9 rounded-full items-center justify-center"
          style={{ backgroundColor: bgSecondary }}
        >
          <Ionicons name="close" size={18} color={textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center mb-4 gap-2">
          <View
            className="w-8 h-8 rounded-xl items-center justify-center"
            style={{ backgroundColor: color + '2E' }}
          >
            <Ionicons name={icon} size={16} color={color} />
          </View>
          <Text className="text-sm font-medium" style={{ color }}>{label}</Text>
        </View>

        {/* Frame capturado al compartir — posicionado fuera de pantalla */}
        <View
          ref={shareFrameRef}
          collapsable={false}
          style={{
            position: 'absolute',
            top: -5000,
            left: 0,
            backgroundColor: 'white',
            padding: 24,
            paddingBottom: 20,
            alignItems: 'center',
          }}
        >
          <QRCode
            value={data || ' '}
            size={220}
            backgroundColor="white"
            color="#0A0A0A"
          />
          <Text style={{ marginTop: 16, fontSize: 13, fontWeight: '500', letterSpacing: 0.3 }}>
            <Text style={{ color: '#0A0A0A' }}>{r.generatedIn}</Text>
            <Text style={{ color: '#0A0A0A' }}>Scan</Text>
            <Text style={{ color: '#17D124' }}>Codi</Text>
          </Text>
        </View>

        <TouchableOpacity
          onLongPress={handleShareImage}
          delayLongPress={220}
          activeOpacity={1}
          className="rounded-2xl p-5 mb-1 items-center"
          style={{ backgroundColor: bgSecondary, borderWidth: 0.5, borderColor: border }}
        >
          <QRCode
            value={data || ' '}
            size={180}
            backgroundColor="transparent"
            color={isDark ? '#F5F5F3' : '#0A0A0A'}
          />
        </TouchableOpacity>
        <Text className="text-xs text-center mb-4" style={{ color: textSecondary }}>
          {r.holdToShare}
        </Text>

        {qrType !== 'wifi' && <View
          className="rounded-2xl p-4 mb-4"
          style={{ backgroundColor: bgSecondary, borderWidth: 0.5, borderColor: border, flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}
        >
          <Text
            selectable
            style={{
              flex: 1,
              color: text,
              fontFamily: qrType === 'url' ? 'Courier' : undefined,
              fontSize: qrType === 'url' ? 13 : 15,
              lineHeight: qrType === 'url' ? 20 : 22,
            }}
          >
            {data}
          </Text>
          <TouchableOpacity onPress={handleCopy} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons
              name={copied ? 'checkmark-outline' : 'copy-outline'}
              size={18}
              color={copied ? '#00C896' : textSecondary}
            />
          </TouchableOpacity>
        </View>}

        <TouchableOpacity
          onPress={handleSmartAction}
          className="rounded-2xl py-4 flex-row items-center justify-center gap-2 mb-6"
          style={{ backgroundColor: color }}
          activeOpacity={0.85}
        >
          <Ionicons name={getSmartActionIcon()} size={18} color="white" />
          <Text className="text-white font-medium text-base">{getSmartActionLabel()}</Text>
        </TouchableOpacity>

        {BannerAd && BannerAdSize && !settings.isPro && (
          <View style={{ alignItems: 'center' }}>
            <BannerAd
              unitId={AD_UNITS.banner}
              size={BannerAdSize.MEDIUM_RECTANGLE}
              requestOptions={{ requestNonPersonalizedAdsOnly: false }}
            />
          </View>
        )}

      </ScrollView>
    </View>
  );
}

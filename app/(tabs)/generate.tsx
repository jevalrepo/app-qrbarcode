import React, { useState, useRef } from 'react';
import BannerAdView from '@/components/BannerAdView';
import {
  View, Text, TouchableOpacity, TextInput, ScrollView, Alert, Platform, Modal,
} from 'react-native';
import { captureRef } from 'react-native-view-shot';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

let MediaLibrary: any = null;
try { MediaLibrary = require('expo-media-library'); } catch {}
import QRCode from 'react-native-qrcode-svg';
import { useT, useAccent, useThemeScheme } from '@/context/SettingsContext';
import { useGenerationHistory } from '@/hooks/useGenerationHistory';
import { QRType } from '@/lib/detectType';

type QRGenerateType = 'url' | 'text' | 'wifi' | 'email' | 'phone' | 'vcard';

const TYPE_IDS: QRGenerateType[] = ['url', 'text', 'wifi', 'email', 'phone', 'vcard'];
const TYPE_ICONS: Record<QRGenerateType, keyof typeof Ionicons.glyphMap> = {
  url: 'globe-outline',
  text: 'document-text-outline',
  wifi: 'wifi-outline',
  email: 'mail-outline',
  phone: 'call-outline',
  vcard: 'person-outline',
};

type WifiSecurity = 'WPA' | 'WEP' | 'nopass';

function buildQRData(
  type: QRGenerateType,
  value: string,
  wifiPass: string,
  vcardPhone: string,
  vcardEmail: string,
  vcardOrg: string,
  wifiSecurity: WifiSecurity = 'WPA',
): string {
  switch (type) {
    case 'wifi':
      return wifiSecurity === 'nopass'
        ? `WIFI:T:;S:${value};;;`
        : `WIFI:T:${wifiSecurity};S:${value};P:${wifiPass};;`;
    case 'email': return value.includes('@') ? `mailto:${value}` : value;
    case 'phone': return `tel:${value}`;
    case 'url': return value.startsWith('http') ? value : `https://${value}`;
    case 'vcard': {
      const lines = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `FN:${value}`,
        vcardPhone ? `TEL:${vcardPhone}` : '',
        vcardEmail ? `EMAIL:${vcardEmail}` : '',
        vcardOrg ? `ORG:${vcardOrg}` : '',
        'END:VCARD',
      ].filter(Boolean);
      return lines.join('\n');
    }
    default: return value;
  }
}

function InputField({
  label, value, onChange, placeholder, isDark, text, textSecondary, bgTertiary,
  keyboardType, secureTextEntry, multiline,
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder: string;
  isDark: boolean; text: string; textSecondary: string; bgTertiary: string;
  keyboardType?: 'default' | 'email-address' | 'phone-pad'; secureTextEntry?: boolean;
  multiline?: boolean;
}) {
  return (
    <View className="rounded-2xl mb-3 overflow-hidden" style={{ backgroundColor: bgTertiary }}>
      <Text className="text-xs font-semibold tracking-widest px-4 pt-3 pb-1" style={{ color: textSecondary }}>
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={isDark ? '#4A4A45' : '#BBBBB6'}
        style={{
          color: text, fontSize: 16, paddingHorizontal: 16, paddingTop: 4, paddingBottom: 16,
          minHeight: multiline ? 120 : undefined,
          textAlignVertical: multiline ? 'top' : 'center',
          // @ts-ignore
          outline: 'none',
        }}
        autoCapitalize="none"
        autoCorrect={false}
        underlineColorAndroid="transparent"
        keyboardType={keyboardType ?? 'default'}
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        blurOnSubmit={!multiline}
      />
    </View>
  );
}

export default function GenerateScreen() {
  const insets = useSafeAreaInsets();
  const scheme = useThemeScheme();
  const isDark = scheme === 'dark';
  const t = useT();
  const g = t.generate;
  const r = t.result;
  const accent = useAccent();

  const { addToGenerationHistory } = useGenerationHistory();
  const [activeType, setActiveType] = useState<QRGenerateType>('url');
  const [value, setValue] = useState('');
  const [wifiPass, setWifiPass] = useState('');
  const [wifiSecurity, setWifiSecurity] = useState<WifiSecurity>('WPA');
  const [vcardPhone, setVcardPhone] = useState('');
  const [vcardEmail, setVcardEmail] = useState('');
  const [vcardOrg, setVcardOrg] = useState('');
  const [generated, setGenerated] = useState<string | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [imageSaved, setImageSaved] = useState(false);
  const svgRef = useRef<{ toDataURL: (cb: (data: string) => void) => void } | null>(null);
  const shareFrameRef = useRef<View>(null);

  const bg = isDark ? '#0A0A0A' : '#FFFFFF';
  const bgSecondary = isDark ? '#141414' : '#F5F5F3';
  const bgTertiary = isDark ? '#1E1E1E' : '#EBEBEA';
  const border = isDark ? '#2A2A2A' : '#E8E8E6';
  const text = isDark ? '#F5F5F3' : '#0A0A0A';
  const textSecondary = '#888780';
  const overlay = isDark ? 'rgba(10,10,10,0.72)' : 'rgba(10,10,10,0.24)';
  const canGenerate = value.trim().length > 0;
  const activeDescription = g.descriptions[activeType];

  function closeAndReset() {
    setPreviewVisible(false);
    setValue('');
    setWifiPass('');
    setWifiSecurity('WPA');
    setVcardPhone('');
    setVcardEmail('');
    setVcardOrg('');
    setGenerated(null);
  }

  function downloadWebPng(base64: string) {
    if (typeof document === 'undefined') return;
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${base64}`;
    link.download = `qr-barcode-scanner_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async function handleSaveToGallery() {
    if (!generated || !MediaLibrary || !shareFrameRef.current) return;
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') { Alert.alert('Error', g.saveError); return; }
      await new Promise(resolve => setTimeout(resolve, 100));
      const uri = await captureRef(shareFrameRef, { format: 'png', quality: 1 });
      await MediaLibrary.saveToLibraryAsync(uri);
      setImageSaved(true);
      setTimeout(() => setImageSaved(false), 1800);
    } catch (e) {
      console.error('[SaveToGallery]', e);
      Alert.alert('Error', g.saveError);
    }
  }

  async function handleShare() {
    if (!generated) return;
    if (Platform.OS === 'web') {
      svgRef.current?.toDataURL((base64: string) => downloadWebPng(base64));
      return;
    }
    if (!shareFrameRef.current) return;
    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      const uri = await captureRef(shareFrameRef, { format: 'png', quality: 1 });
      await Sharing.shareAsync(uri, { mimeType: 'image/png', UTI: 'public.png' });
    } catch (e) {
      console.error('[ShareImage]', e);
      Alert.alert('Error', g.shareError);
    }
  }

  function handleTypeChange(type: QRGenerateType) {
    setActiveType(type);
    setValue('');
    setWifiPass('');
    setWifiSecurity('WPA');
    setVcardPhone('');
    setVcardEmail('');
    setVcardOrg('');
    setGenerated(null);
    setPreviewVisible(false);
  }

  function handleGenerate() {
    if (activeType === 'phone') {
      const digits = value.replace(/\D/g, '');
      if (digits.length < 7) {
        Alert.alert('', g.phoneInvalid);
        return;
      }
    }
    const next = buildQRData(activeType, value.trim(), wifiPass.trim(), vcardPhone.trim(), vcardEmail.trim(), vcardOrg.trim(), wifiSecurity);
    setGenerated(next);
    setPreviewVisible(true);
    addToGenerationHistory({ data: next, type: activeType as QRType });
  }

  const labelMap: Record<QRGenerateType, string> = {
    url: g.labels.url, text: g.labels.text, wifi: g.labels.wifi,
    email: g.labels.email, phone: g.labels.phone, vcard: g.labels.vcardName,
  };

  const placeholderMap: Record<QRGenerateType, string> = {
    url: g.placeholders.url, text: g.placeholders.text, wifi: g.placeholders.wifi,
    email: g.placeholders.email, phone: g.placeholders.phone, vcard: g.placeholders.vcardName,
  };

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingTop: insets.top + 22, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View className="px-5 mb-5">
        <View className="flex-row items-center justify-between">
          <View className="flex-1 pr-4">
            <Text className="text-lg font-medium" style={{ color: text }}>{g.title}</Text>
            <Text className="text-sm mt-1" style={{ color: textSecondary }}>{activeDescription}</Text>
          </View>
          <View className="w-11 h-11 rounded-2xl items-center justify-center" style={{ backgroundColor: accent + '18' }}>
            <Ionicons name={TYPE_ICONS[activeType]} size={20} color={accent} />
          </View>
        </View>
      </View>

      <View className="px-5 mb-3">
        <View
          className="rounded-[28px] p-5"
          style={{ backgroundColor: bgSecondary, borderWidth: 0.5, borderColor: border }}
        >
          {/* type selector */}
          <View className="flex-row flex-wrap gap-2 mb-5">
            {TYPE_IDS.map((id) => {
              const active = activeType === id;
              return (
                <TouchableOpacity
                  key={id}
                  onPress={() => handleTypeChange(id)}
                  className="rounded-2xl px-4 py-3"
                  style={{
                    backgroundColor: active ? accent : bgTertiary,
                    borderWidth: 0.5,
                    borderColor: active ? accent : border,
                    width: '48%',
                  }}
                >
                  <Ionicons name={TYPE_ICONS[id]} size={16} color={active ? 'white' : textSecondary} />
                  <Text className="text-sm font-medium mt-2" style={{ color: active ? 'white' : text }}>
                    {g.types[id]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* main input */}
          <InputField
            label={labelMap[activeType]}
            value={value}
            onChange={(v) => { setValue(v); setGenerated(null); }}
            placeholder={placeholderMap[activeType]}
            isDark={isDark} text={text} textSecondary={textSecondary} bgTertiary={bgTertiary}
            keyboardType={activeType === 'phone' ? 'phone-pad' : activeType === 'email' ? 'email-address' : 'default'}
            multiline={activeType === 'text'}
          />

          {/* wifi security + password */}
          {activeType === 'wifi' && (
            <>
              <View className="rounded-2xl mb-3 overflow-hidden" style={{ backgroundColor: bgTertiary }}>
                <Text className="text-xs font-semibold tracking-widest px-4 pt-3 pb-2" style={{ color: textSecondary }}>
                  {g.labels.wifiSecurity}
                </Text>
                <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 12, paddingBottom: 12 }}>
                  {(['WPA', 'WEP', 'nopass'] as WifiSecurity[]).map((opt) => {
                    const active = wifiSecurity === opt;
                    const label = opt === 'nopass' ? g.labels.wifiSecurityNone : opt;
                    return (
                      <TouchableOpacity
                        key={opt}
                        onPress={() => { setWifiSecurity(opt); setGenerated(null); }}
                        style={{
                          flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center',
                          backgroundColor: active ? accent : (isDark ? '#2A2A2A' : '#DDDDD8'),
                        }}
                        activeOpacity={0.7}
                      >
                        <Text style={{ fontSize: 13, fontWeight: '500', color: active ? 'white' : textSecondary }}>
                          {label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
              {wifiSecurity !== 'nopass' && (
                <InputField
                  label={g.labels.password}
                  value={wifiPass}
                  onChange={(v) => { setWifiPass(v); setGenerated(null); }}
                  placeholder={g.placeholders.password}
                  isDark={isDark} text={text} textSecondary={textSecondary} bgTertiary={bgTertiary}
                  secureTextEntry
                />
              )}
            </>
          )}

          {/* vcard extra fields */}
          {activeType === 'vcard' && (
            <>
              <InputField
                label={g.labels.vcardPhone}
                value={vcardPhone}
                onChange={(v) => { setVcardPhone(v); setGenerated(null); }}
                placeholder={g.placeholders.vcardPhone}
                isDark={isDark} text={text} textSecondary={textSecondary} bgTertiary={bgTertiary}
                keyboardType="phone-pad"
              />
              <InputField
                label={g.labels.vcardEmail}
                value={vcardEmail}
                onChange={(v) => { setVcardEmail(v); setGenerated(null); }}
                placeholder={g.placeholders.vcardEmail}
                isDark={isDark} text={text} textSecondary={textSecondary} bgTertiary={bgTertiary}
                keyboardType="email-address"
              />
              <InputField
                label={g.labels.vcardOrg}
                value={vcardOrg}
                onChange={(v) => { setVcardOrg(v); setGenerated(null); }}
                placeholder={g.placeholders.vcardOrg}
                isDark={isDark} text={text} textSecondary={textSecondary} bgTertiary={bgTertiary}
              />
            </>
          )}

          <TouchableOpacity
            onPress={handleGenerate}
            disabled={!canGenerate}
            className="rounded-2xl py-4 items-center mt-2"
            style={{ backgroundColor: canGenerate ? accent : bgTertiary }}
            activeOpacity={0.85}
          >
            <Text className="font-medium text-base" style={{ color: canGenerate ? 'white' : textSecondary }}>
              {g.generateBtn}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Frame oculto fuera de pantalla capturado al compartir */}
      {!!generated && (
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
            value={generated}
            size={220}
            backgroundColor="white"
            color="#0A0A0A"
            quietZone={16}
          />
          <Text style={{ marginTop: 16, fontSize: 13, fontWeight: '500', letterSpacing: 0.3 }}>
            <Text style={{ color: '#0A0A0A' }}>{r.generatedIn}</Text>
            <Text style={{ color: '#0A0A0A' }}>Scan</Text>
            <Text style={{ color: '#17D124' }}>Codi</Text>
          </Text>
        </View>
      )}

      <Modal
        visible={previewVisible && !!generated}
        transparent
        animationType="fade"
        onRequestClose={closeAndReset}
      >
        <View className="flex-1 items-center justify-center px-5" style={{ backgroundColor: overlay }}>
          <View
            className="w-full max-w-[360px] rounded-[32px] p-5"
            style={{ backgroundColor: bgSecondary, borderWidth: 0.5, borderColor: border }}
          >
            <View className="flex-row items-center justify-end mb-4">
              <TouchableOpacity
                onPress={closeAndReset}
                className="w-10 h-10 rounded-full items-center justify-center"
                style={{ backgroundColor: bgTertiary }}
              >
                <Ionicons name="close" size={18} color={textSecondary} />
              </TouchableOpacity>
            </View>

            <View className="rounded-[24px] bg-white p-4 items-center self-center">
              <QRCode
                  value={generated ?? ''}
                  size={220}
                  backgroundColor="white"
                  color="#0A0A0A"
                  quietZone={16}
                  getRef={(ref) => { svgRef.current = ref as typeof svgRef.current; }}
                />
            </View>

            <TouchableOpacity
              onPress={handleShare}
              className="rounded-2xl py-4 flex-row items-center justify-center gap-2 mb-2"
              style={{ backgroundColor: accent, marginTop: 20 }}
              activeOpacity={0.85}
            >
              <Ionicons name="share-outline" size={18} color="white" />
              <Text className="font-medium text-base text-white">
                {Platform.OS === 'web' ? g.download : g.share}
              </Text>
            </TouchableOpacity>

            {Platform.OS !== 'web' && (
              <TouchableOpacity
                onPress={handleSaveToGallery}
                className="rounded-2xl py-4 flex-row items-center justify-center gap-2 mb-2"
                style={{ backgroundColor: bgTertiary }}
                activeOpacity={0.75}
              >
                <Ionicons
                  name={imageSaved ? 'checkmark-outline' : 'download-outline'}
                  size={18}
                  color={imageSaved ? '#00C896' : textSecondary}
                />
                <Text className="font-medium text-base" style={{ color: imageSaved ? '#00C896' : textSecondary }}>
                  {imageSaved ? g.savedToGallery : g.saveToGallery}
                </Text>
              </TouchableOpacity>
            )}

          </View>
        </View>
      </Modal>
    </ScrollView>
    <BannerAdView />
    </View>
  );
}

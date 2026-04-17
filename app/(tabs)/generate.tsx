import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, TextInput, ScrollView, Alert, Platform, Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import QRCode from 'react-native-qrcode-svg';
import { useT, useAccent, useThemeScheme } from '@/context/SettingsContext';

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

function buildQRData(
  type: QRGenerateType,
  value: string,
  wifiPass: string,
  vcardPhone: string,
  vcardEmail: string,
  vcardOrg: string,
): string {
  switch (type) {
    case 'wifi': return `WIFI:T:WPA;S:${value};P:${wifiPass};;`;
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
  keyboardType, secureTextEntry,
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder: string;
  isDark: boolean; text: string; textSecondary: string; bgTertiary: string;
  keyboardType?: 'default' | 'email-address' | 'phone-pad'; secureTextEntry?: boolean;
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
          // @ts-ignore
          outline: 'none',
        }}
        autoCapitalize="none"
        autoCorrect={false}
        underlineColorAndroid="transparent"
        keyboardType={keyboardType ?? 'default'}
        secureTextEntry={secureTextEntry}
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
  const accent = useAccent();

  const [activeType, setActiveType] = useState<QRGenerateType>('url');
  const [value, setValue] = useState('');
  const [wifiPass, setWifiPass] = useState('');
  const [vcardPhone, setVcardPhone] = useState('');
  const [vcardEmail, setVcardEmail] = useState('');
  const [vcardOrg, setVcardOrg] = useState('');
  const [generated, setGenerated] = useState<string | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [imageCopied, setImageCopied] = useState(false);
  const svgRef = useRef<{ toDataURL: (cb: (data: string) => void) => void } | null>(null);

  const bg = isDark ? '#0A0A0A' : '#FFFFFF';
  const bgSecondary = isDark ? '#141414' : '#F5F5F3';
  const bgTertiary = isDark ? '#1E1E1E' : '#EBEBEA';
  const border = isDark ? '#2A2A2A' : '#E8E8E6';
  const text = isDark ? '#F5F5F3' : '#0A0A0A';
  const textSecondary = '#888780';
  const overlay = isDark ? 'rgba(10,10,10,0.72)' : 'rgba(10,10,10,0.24)';
  const canGenerate = value.trim().length > 0;
  const activeDescription = g.descriptions[activeType];

  function downloadWebPng(base64: string) {
    if (typeof document === 'undefined') return;
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${base64}`;
    link.download = `qr-barcode-scanner_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async function handleShare() {
    if (!svgRef.current || !generated) return;
    svgRef.current.toDataURL(async (base64: string) => {
      try {
        if (Platform.OS === 'web') { downloadWebPng(base64); return; }
        const path = `${FileSystem.cacheDirectory}qr-barcode-scanner_${Date.now()}.png`;
        await FileSystem.writeAsStringAsync(path, base64, { encoding: FileSystem.EncodingType.Base64 });
        await Sharing.shareAsync(path, { mimeType: 'image/png', UTI: 'public.png' });
      } catch {
        Alert.alert('Error', g.shareError);
      }
    });
  }

  async function handleCopyImage() {
    if (!svgRef.current || !generated) return;
    svgRef.current.toDataURL(async (base64: string) => {
      try {
        await Clipboard.setImageAsync(base64);
        setImageCopied(true);
        setTimeout(() => setImageCopied(false), 1800);
      } catch {
        Alert.alert('Error', g.imageCopyError);
      }
    });
  }

  function handleTypeChange(type: QRGenerateType) {
    setActiveType(type);
    setValue('');
    setWifiPass('');
    setVcardPhone('');
    setVcardEmail('');
    setVcardOrg('');
    setGenerated(null);
    setPreviewVisible(false);
    setImageCopied(false);
  }

  function handleGenerate() {
    const next = buildQRData(activeType, value.trim(), wifiPass.trim(), vcardPhone.trim(), vcardEmail.trim(), vcardOrg.trim());
    setGenerated(next);
    setPreviewVisible(true);
    setImageCopied(false);
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
    <ScrollView
      style={{ flex: 1, backgroundColor: bg }}
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
          />

          {/* wifi password */}
          {activeType === 'wifi' && (
            <InputField
              label={g.labels.password}
              value={wifiPass}
              onChange={(v) => { setWifiPass(v); setGenerated(null); }}
              placeholder={g.placeholders.password}
              isDark={isDark} text={text} textSecondary={textSecondary} bgTertiary={bgTertiary}
              secureTextEntry
            />
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

      <Modal
        visible={previewVisible && !!generated}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewVisible(false)}
      >
        <View className="flex-1 items-center justify-center px-5" style={{ backgroundColor: overlay }}>
          <View
            className="w-full max-w-[360px] rounded-[32px] p-5"
            style={{ backgroundColor: bgSecondary, borderWidth: 0.5, borderColor: border }}
          >
            <View className="flex-row items-center justify-end mb-4">
              <TouchableOpacity
                onPress={() => setPreviewVisible(false)}
                className="w-10 h-10 rounded-full items-center justify-center"
                style={{ backgroundColor: bgTertiary }}
              >
                <Ionicons name="close" size={18} color={textSecondary} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity onLongPress={handleCopyImage} activeOpacity={1} delayLongPress={220} className="self-center">
              <View className="rounded-[24px] bg-white p-4 items-center self-center">
                <QRCode
                  value={generated ?? ''}
                  size={220}
                  backgroundColor="white"
                  color="#0A0A0A"
                  getRef={(ref) => { svgRef.current = ref as typeof svgRef.current; }}
                />
              </View>
            </TouchableOpacity>

            <Text className="text-xs text-center mt-4" style={{ color: imageCopied ? accent : textSecondary }}>
              {imageCopied ? g.imageCopied : g.holdToCopy}
            </Text>
            <Text className="text-xs text-center mt-3 mb-4" numberOfLines={2} style={{ color: textSecondary }}>
              {generated}
            </Text>

            <TouchableOpacity
              onPress={handleShare}
              className="rounded-2xl py-4 flex-row items-center justify-center gap-2 mb-2"
              style={{ backgroundColor: accent }}
              activeOpacity={0.85}
            >
              <Ionicons name="share-outline" size={18} color="white" />
              <Text className="font-medium text-base text-white">
                {Platform.OS === 'web' ? g.download : g.share}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setPreviewVisible(false)}
              className="rounded-2xl py-4 items-center"
              style={{ backgroundColor: bgTertiary }}
              activeOpacity={0.75}
            >
              <Text className="font-medium text-base" style={{ color: textSecondary }}>{t.scanner.cancel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

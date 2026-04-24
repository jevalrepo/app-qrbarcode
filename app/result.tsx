import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, Linking, Alert, Share,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Contacts from 'expo-contacts';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppSettings, useT, useAccent, useThemeScheme } from '@/context/SettingsContext';
import { QRType, getTypeLabel, getTypeIcon, getTypeColor, parseWifi } from '@/lib/detectType';

export default function ResultScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data, type } = useLocalSearchParams<{ data: string; type: string }>();
  const scheme = useThemeScheme();
  const isDark = scheme === 'dark';
  const [copied, setCopied] = useState(false);
  const [imageCopied, setImageCopied] = useState(false);
  const svgRef = useRef<{ toDataURL: (cb: (data: string) => void) => void } | null>(null);
  const { settings } = useAppSettings();
  const t = useT();
  const r = t.result;
  const g = t.generate;
  const accent = useAccent();

  const qrType = (type as QRType) ?? 'text';
  const color = getTypeColor(qrType, accent);
  const icon = getTypeIcon(qrType) as keyof typeof Ionicons.glyphMap;
  const label = getTypeLabel(qrType);

  useEffect(() => {
    if (settings.autoOpenUrls && qrType === 'url' && data) {
      Linking.openURL(data.startsWith('http') ? data : `https://${data}`).catch(() => {});
    }
  }, []);

  const bg = isDark ? '#0A0A0A' : '#FFFFFF';
  const bgSecondary = isDark ? '#141414' : '#F5F5F3';
  const border = isDark ? '#2A2A2A' : '#E8E8E6';
  const text = isDark ? '#F5F5F3' : '#0A0A0A';
  const textSecondary = '#888780';

  function handleCopyImage() {
    if (!svgRef.current) return;
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

  async function handleCopy() {
    await Clipboard.setStringAsync(data ?? '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleShare() {
    try {
      await Share.share({ message: data ?? '' });
    } catch {}
  }

  async function handleAddContact() {
    if (!data) return;
    const { status } = await Contacts.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('', r.contactError);
      return;
    }
    try {
      const name = data.match(/FN:([^\r\n]+)/i)?.[1]?.trim() ?? '';
      const phone = data.match(/TEL[^:]*:([^\r\n]+)/i)?.[1]?.trim();
      const email = data.match(/EMAIL[^:]*:([^\r\n]+)/i)?.[1]?.trim();
      const org = data.match(/ORG:([^\r\n]+)/i)?.[1]?.trim();

      const contact: Contacts.Contact = {
        contactType: Contacts.ContactTypes.Person,
        name,
        firstName: name.split(' ')[0] ?? name,
        lastName: name.split(' ').slice(1).join(' ') || undefined,
        phoneNumbers: phone ? [{ label: 'mobile', number: phone }] : undefined,
        emails: email ? [{ label: 'work', email }] : undefined,
        company: org,
      };

      await Contacts.addContactAsync(contact);
      Alert.alert('', r.contactSaved);
    } catch {
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
        const { ssid, password } = parseWifi(data);
        Alert.alert(r.wifiTitle, `SSID: ${ssid}\n${r.copyPassword.replace('Copiar', '').trim()}: ${password}`, [
          { text: r.copyPassword, onPress: () => Clipboard.setStringAsync(password) },
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
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 20 }}
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

        {/* QR oculto con fondo blanco, usado exclusivamente para copiar al clipboard */}
        <View style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}>
          <QRCode
            value={data || ' '}
            size={180}
            backgroundColor="white"
            color="#0A0A0A"
            getRef={(ref) => { svgRef.current = ref as typeof svgRef.current; }}
          />
        </View>

        <TouchableOpacity
          onLongPress={handleCopyImage}
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
        <Text className="text-xs text-center mb-4" style={{ color: imageCopied ? accent : textSecondary }}>
          {imageCopied ? g.imageCopied : g.holdToCopy}
        </Text>

        <View
          className="rounded-2xl p-4 mb-4"
          style={{ backgroundColor: bgSecondary, borderWidth: 0.5, borderColor: border }}
        >
          <Text
            selectable
            style={{
              color: text,
              fontFamily: qrType === 'url' ? 'Courier' : undefined,
              fontSize: qrType === 'url' ? 13 : 15,
              lineHeight: qrType === 'url' ? 20 : 22,
            }}
          >
            {data}
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleSmartAction}
          className="rounded-2xl py-4 flex-row items-center justify-center gap-2 mb-3"
          style={{ backgroundColor: color }}
          activeOpacity={0.85}
        >
          <Ionicons name={getSmartActionIcon()} size={18} color="white" />
          <Text className="text-white font-medium text-base">{getSmartActionLabel()}</Text>
        </TouchableOpacity>

        {getSmartActionLabel() !== r.copy && (
          <TouchableOpacity
            onPress={handleCopy}
            className="rounded-2xl py-4 flex-row items-center justify-center gap-2 mb-3"
            style={{ backgroundColor: bgSecondary, borderWidth: 0.5, borderColor: border }}
            activeOpacity={0.7}
          >
            <Ionicons
              name={copied ? 'checkmark-outline' : 'copy-outline'}
              size={18}
              color={copied ? '#00C896' : textSecondary}
            />
            <Text className="font-medium text-base" style={{ color: copied ? '#00C896' : textSecondary }}>
              {copied ? r.copied : r.copy}
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={handleShare}
          className="rounded-2xl py-4 flex-row items-center justify-center gap-2"
          style={{ backgroundColor: bgSecondary, borderWidth: 0.5, borderColor: border }}
          activeOpacity={0.7}
        >
          <Ionicons name="share-outline" size={18} color={textSecondary} />
          <Text className="font-medium text-base" style={{ color: textSecondary }}>{r.share}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

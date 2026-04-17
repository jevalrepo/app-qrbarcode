import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHistory } from '@/hooks/useHistory';
import { useT, useAccent, useThemeScheme } from '@/context/SettingsContext';
import ScanResultCard from '@/components/ScanResultCard';
import BannerAdView from '@/components/BannerAdView';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scheme = useThemeScheme();
  const isDark = scheme === 'dark';
  const { history } = useHistory();
  const t = useT();
  const h = t.home;
  const accent = useAccent();

  const bg = isDark ? '#0A0A0A' : '#FFFFFF';
  const bgSecondary = isDark ? '#141414' : '#F5F5F3';
  const border = isDark ? '#2A2A2A' : '#E8E8E6';
  const text = isDark ? '#F5F5F3' : '#0A0A0A';
  const textSecondary = '#888780';
  const recents = history.slice(0, 3);

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
    <ScrollView
      style={{ flex: 1, backgroundColor: bg }}
      contentContainerStyle={{ paddingTop: insets.top + 22, paddingBottom: 24 }}
      showsVerticalScrollIndicator={false}
    >
      {/* help button */}
      <View className="px-5 mb-4 flex-row justify-end">
        <TouchableOpacity
          onPress={() => router.push('/help')}
          style={{
            width: 36, height: 36, borderRadius: 18,
            backgroundColor: isDark ? '#1E1E1E' : '#EBEBEA',
            alignItems: 'center', justifyContent: 'center',
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="help-outline" size={18} color={textSecondary} />
        </TouchableOpacity>
      </View>

      {/* scan button */}
      <View className="px-5 mb-5">
        <TouchableOpacity
          onPress={() => router.push('/scanner')}
          className="rounded-3xl overflow-hidden"
          style={{ backgroundColor: accent }}
          activeOpacity={0.88}
        >
          <View className="flex-row items-center px-6 py-5 gap-4">
            <View className="w-12 h-12 rounded-2xl items-center justify-center bg-white/20">
              <Ionicons name="scan" size={26} color="white" />
            </View>
          <View className="flex-1">
            <Text className="text-white font-medium text-lg">{h.scanBtn}</Text>
          </View>
            <Ionicons name="arrow-forward" size={20} color="white" />
          </View>
        </TouchableOpacity>
      </View>

      {/* quick actions */}
      <View className="px-5 flex-row gap-3 mb-6">
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/generate')}
          className="flex-1 rounded-2xl p-4"
          style={{ backgroundColor: bgSecondary, borderWidth: 0.5, borderColor: border }}
          activeOpacity={0.7}
        >
          <View
            className="w-9 h-9 rounded-xl items-center justify-center mb-3"
            style={{ backgroundColor: accent + '2E' }}
          >
            <Ionicons name="qr-code-outline" size={18} color={accent} />
          </View>
          <Text className="text-sm font-medium" style={{ color: text }}>{h.generateQR}</Text>
          <Text className="text-xs mt-0.5" style={{ color: textSecondary }}>URL, WiFi, vCard</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/(tabs)/history')}
          className="flex-1 rounded-2xl p-4"
          style={{ backgroundColor: bgSecondary, borderWidth: 0.5, borderColor: border }}
          activeOpacity={0.7}
        >
          <View className="w-9 h-9 rounded-xl items-center justify-center mb-3" style={{ backgroundColor: '#378ADD2E' }}>
            <Ionicons name="time-outline" size={18} color="#378ADD" />
          </View>
          <Text className="text-sm font-medium" style={{ color: text }}>{h.history}</Text>
          <Text className="text-xs mt-0.5" style={{ color: textSecondary }}>
            {history.length} {history.length === 1 ? h.scan : h.scans}
          </Text>
        </TouchableOpacity>
      </View>

      {/* recents */}
      <View className="px-5">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-xs font-medium uppercase tracking-widest" style={{ color: textSecondary }}>
            {h.recents}
          </Text>
          {history.length > 3 && (
            <TouchableOpacity onPress={() => router.push('/(tabs)/history')}>
              <Text className="text-xs font-medium" style={{ color: accent }}>{h.seeAll}</Text>
            </TouchableOpacity>
          )}
        </View>

        {recents.length === 0 ? (
          <View
            className="rounded-2xl p-8 items-center"
            style={{ backgroundColor: bgSecondary, borderWidth: 0.5, borderColor: border }}
          >
            <Ionicons name="scan-outline" size={36} color={textSecondary} />
            <Text className="text-sm font-medium mt-3" style={{ color: text }}>{h.noScans}</Text>
            <Text className="text-xs text-center mt-1" style={{ color: textSecondary }}>{h.noScansDesc}</Text>
            <TouchableOpacity
              onPress={() => router.push('/scanner')}
              className="mt-4 px-5 py-2.5 rounded-xl"
              style={{ backgroundColor: accent + '2E' }}
            >
              <Text className="text-sm font-medium" style={{ color: accent }}>{h.scanNow}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View
            className="rounded-2xl overflow-hidden"
            style={{ backgroundColor: bgSecondary, borderWidth: 0.5, borderColor: border }}
          >
            {recents.map((item, i) => (
              <ScanResultCard key={item.id} item={item} compact showDivider={i < recents.length - 1} />
            ))}
          </View>
        )}
      </View>
    </ScrollView>
    <BannerAdView />
    </View>
  );
}

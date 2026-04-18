import React, { useState, useMemo } from 'react';
import BannerAdView from '@/components/BannerAdView';
import {
  View, Text, TouchableOpacity, FlatList, Alert, ActivityIndicator, TextInput, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHistory, HistoryItem } from '@/hooks/useHistory';
import { useT, useAccent, useThemeScheme } from '@/context/SettingsContext';
import { QRType } from '@/lib/detectType';
import ScanResultCard from '@/components/ScanResultCard';

type FilterType = QRType | 'all' | 'favorites';

const FILTER_TYPES: FilterType[] = ['all', 'favorites', 'url', 'wifi', 'product', 'email', 'phone', 'vcard', 'text'];

export default function HistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scheme = useThemeScheme();
  const isDark = scheme === 'dark';
  const { history, loading, clearHistory, toggleFavorite } = useHistory();
  const t = useT();
  const h = t.history;
  const accent = useAccent();

  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const bg = isDark ? '#0A0A0A' : '#FFFFFF';
  const bgSecondary = isDark ? '#141414' : '#F5F5F3';
  const bgTertiary = isDark ? '#1E1E1E' : '#EBEBEA';
  const border = isDark ? '#2A2A2A' : '#E8E8E6';
  const text = isDark ? '#F5F5F3' : '#0A0A0A';
  const textSecondary = '#888780';

  const filtered = useMemo(() => {
    let items = history;
    if (activeFilter === 'favorites') items = items.filter((i) => i.favorite);
    else if (activeFilter !== 'all') items = items.filter((i) => i.type === activeFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter((i) => i.data.toLowerCase().includes(q));
    }
    return items;
  }, [history, activeFilter, search]);

  function filterLabel(f: FilterType): string {
    if (f === 'all') return h.filterAll;
    if (f === 'favorites') return h.filterFavorites;
    return f.charAt(0).toUpperCase() + f.slice(1);
  }

  function confirmClear() {
    Alert.alert(h.confirmTitle, h.confirmMsg, [
      { text: h.cancel, style: 'cancel' },
      { text: h.confirmBtn, style: 'destructive', onPress: clearHistory },
    ]);
  }

  const isEmpty = history.length === 0;
  const noResults = !isEmpty && filtered.length === 0;

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      {/* header */}
      <View style={{ paddingTop: insets.top + 22 }} className="px-5 pb-3">
        <View className="flex-row items-center justify-end mb-3">
          {history.length > 0 && (
            <TouchableOpacity
              onPress={confirmClear}
              className="px-3 py-1.5 rounded-xl"
              style={{ backgroundColor: '#D85A302E' }}
            >
              <Text className="text-xs font-medium" style={{ color: '#D85A30' }}>{h.clearAll}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* search */}
        {!isEmpty && (
          <View
            className="flex-row items-center rounded-2xl px-3 mb-3"
            style={{ backgroundColor: bgSecondary, height: 40 }}
          >
            <Ionicons name="search-outline" size={16} color={textSecondary} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder={h.searchPlaceholder}
              placeholderTextColor={isDark ? '#4A4A45' : '#BBBBB6'}
              style={{ flex: 1, marginLeft: 8, color: text, fontSize: 14 }}
              autoCapitalize="none"
              autoCorrect={false}
              underlineColorAndroid="transparent"
              // @ts-ignore
              outline="none"
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={16} color={textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* filter chips */}
        {!isEmpty && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-5 px-5">
            <View className="flex-row gap-2">
              {FILTER_TYPES.map((f) => {
                const active = activeFilter === f;
                return (
                  <TouchableOpacity
                    key={f}
                    onPress={() => setActiveFilter(f)}
                    className="px-3 py-1.5 rounded-full"
                    style={{
                      backgroundColor: active ? accent : bgTertiary,
                      borderWidth: 0.5,
                      borderColor: active ? accent : border,
                    }}
                  >
                    <Text
                      className="text-xs font-medium"
                      style={{ color: active ? 'white' : textSecondary }}
                    >
                      {filterLabel(f)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        )}
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={accent} />
        </View>
      ) : isEmpty ? (
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="time-outline" size={48} color={textSecondary} />
          <Text className="text-lg font-medium mt-4" style={{ color: text }}>{h.empty}</Text>
          <Text className="text-sm text-center mt-2" style={{ color: textSecondary }}>{h.emptyDesc}</Text>
          <TouchableOpacity
            onPress={() => router.push('/scanner')}
            className="mt-6 px-6 py-3 rounded-2xl"
            style={{ backgroundColor: accent }}
          >
            <Text className="text-white font-medium">{h.scanNow}</Text>
          </TouchableOpacity>
        </View>
      ) : noResults ? (
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons
            name={activeFilter === 'favorites' ? 'star-outline' : 'search-outline'}
            size={48}
            color={textSecondary}
          />
          <Text className="text-lg font-medium mt-4" style={{ color: text }}>
            {activeFilter === 'favorites' ? h.noFavorites : h.noResults}
          </Text>
          <Text className="text-sm text-center mt-2" style={{ color: textSecondary }}>
            {activeFilter === 'favorites' ? h.noFavoritesDesc : h.noResultsDesc}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item: HistoryItem) => item.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24, paddingTop: 8 }}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          renderItem={({ item }: { item: HistoryItem }) => (
            <View
              className="rounded-2xl overflow-hidden"
              style={{ backgroundColor: bgSecondary, borderWidth: 0.5, borderColor: border }}
            >
              <ScanResultCard item={item} onToggleFavorite={toggleFavorite} />
            </View>
          )}
        />
      )}
      <BannerAdView />
    </View>
  );
}

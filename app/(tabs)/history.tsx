import React, { useState, useMemo, useCallback } from 'react';
import BannerAdView from '@/components/BannerAdView';
import {
  View, Text, TouchableOpacity, FlatList, Alert, ActivityIndicator,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHistory, HistoryItem } from '@/hooks/useHistory';
import { useGenerationHistory, GenerationItem } from '@/hooks/useGenerationHistory';
import { useT, useAccent, useThemeScheme, useAppSettings } from '@/context/SettingsContext';
import ScanResultCard from '@/components/ScanResultCard';

type ActiveTab = 'scans' | 'generations';

export default function HistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scheme = useThemeScheme();
  const isDark = scheme === 'dark';
  const {
    history, loading, clearHistory, toggleFavorite,
    removeFromHistory, reload: reloadHistory,
  } = useHistory();
  const {
    generations, loading: genLoading, clearGenerationHistory,
    toggleGenerationFavorite, removeFromGenerationHistory, reload: reloadGenerations,
  } = useGenerationHistory();
  const { settings } = useAppSettings();
  const isPro = settings.isPro;
  const t = useT();
  const h = t.history;
  const accent = useAccent();

  const [activeTab, setActiveTab] = useState<ActiveTab>('scans');

  useFocusEffect(
    useCallback(() => {
      reloadHistory();
      reloadGenerations();
    }, [reloadHistory, reloadGenerations]),
  );

  const bg = isDark ? '#0A0A0A' : '#FFFFFF';
  const bgSecondary = isDark ? '#141414' : '#F5F5F3';
  const bgTertiary = isDark ? '#1E1E1E' : '#EBEBEA';
  const border = isDark ? '#2A2A2A' : '#E8E8E6';
  const text = isDark ? '#F5F5F3' : '#0A0A0A';
  const textSecondary = '#888780';

  const scanFavorites = useMemo(() => history.filter((i) => i.favorite), [history]);
  const genFavorites = useMemo(() => generations.filter((g) => g.favorite), [generations]);

  const nonFavoriteScans = useMemo(() => {
    if (scanFavorites.length > 0) return history.filter((i) => !i.favorite);
    return history;
  }, [history, scanFavorites]);

  const nonFavoriteGens = useMemo(() => {
    if (genFavorites.length > 0) return generations.filter((g) => !g.favorite);
    return generations;
  }, [generations, genFavorites]);

  function confirmDeleteItem(id: string, isGeneration: boolean) {
    Alert.alert(h.confirmItemTitle, h.confirmItemMsg, [
      { text: h.cancel, style: 'cancel' },
      {
        text: h.confirmBtn, style: 'destructive',
        onPress: () => isGeneration ? removeFromGenerationHistory(id) : removeFromHistory(id),
      },
    ]);
  }

  function confirmClear() {
    Alert.alert(h.confirmTitle, h.confirmMsg, [
      { text: h.cancel, style: 'cancel' },
      { text: h.confirmBtn, style: 'destructive', onPress: clearHistory },
    ]);
  }

  function confirmClearGenerations() {
    Alert.alert(h.confirmTitle, h.confirmGenerationsMsg, [
      { text: h.cancel, style: 'cancel' },
      { text: h.confirmBtn, style: 'destructive', onPress: clearGenerationHistory },
    ]);
  }

  const isScansEmpty = history.length === 0;
  const isGensEmpty = generations.length === 0;

  function renderProSection(
    items: (HistoryItem | GenerationItem)[],
    label: string,
    onToggle: (id: string) => void,
  ) {
    if (items.length === 0) return null;
    return (
      <View style={{ marginBottom: 20 }}>
        <Text style={{
          fontSize: 11, fontWeight: '600', letterSpacing: 1.2,
          color: textSecondary, marginBottom: 8, textTransform: 'uppercase',
        }}>
          {label}
        </Text>
        <View style={{
          backgroundColor: bgSecondary, borderRadius: 16,
          overflow: 'hidden', borderWidth: 0.5, borderColor: border,
        }}>
          {items.map((item, idx) => (
            <ScanResultCard
              key={item.id}
              item={item as HistoryItem}
              onToggleFavorite={onToggle}
              showDivider={idx < items.length - 1}
            />
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      {/* header */}
      <View style={{ paddingTop: insets.top + 22, paddingHorizontal: 20, paddingBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', borderRadius: 16, overflow: 'hidden', backgroundColor: bgTertiary }}>
            <TouchableOpacity
              onPress={() => setActiveTab('scans')}
              style={{
                paddingHorizontal: 16, paddingVertical: 8, borderRadius: 14,
                backgroundColor: activeTab === 'scans' ? accent : 'transparent',
              }}
            >
              <Text style={{ color: activeTab === 'scans' ? 'white' : textSecondary, fontSize: 13, fontWeight: '500' }}>
                {h.tabScans}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab('generations')}
              style={{
                paddingHorizontal: 16, paddingVertical: 8, borderRadius: 14,
                backgroundColor: activeTab === 'generations' ? accent : 'transparent',
              }}
            >
              <Text style={{ color: activeTab === 'generations' ? 'white' : textSecondary, fontSize: 13, fontWeight: '500' }}>
                {h.tabGenerations}
              </Text>
            </TouchableOpacity>
          </View>

          {activeTab === 'scans' && history.length > 0 && (
            <TouchableOpacity
              onPress={confirmClear}
              style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, backgroundColor: '#D85A302E' }}
            >
              <Text style={{ fontSize: 12, fontWeight: '500', color: '#D85A30' }}>{h.clearAll}</Text>
            </TouchableOpacity>
          )}
          {activeTab === 'generations' && generations.length > 0 && (
            <TouchableOpacity
              onPress={confirmClearGenerations}
              style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, backgroundColor: '#D85A302E' }}
            >
              <Text style={{ fontSize: 12, fontWeight: '500', color: '#D85A30' }}>{h.clearAll}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── TAB: ESCANEOS ── */}
      {activeTab === 'scans' && (
        loading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator color={accent} />
          </View>
        ) : isScansEmpty ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
            <Ionicons name="time-outline" size={48} color={textSecondary} />
            <Text style={{ fontSize: 18, fontWeight: '500', marginTop: 16, color: text }}>{h.empty}</Text>
            <Text style={{ fontSize: 14, textAlign: 'center', marginTop: 8, color: textSecondary }}>{h.emptyDesc}</Text>
            <TouchableOpacity
              onPress={() => router.push('/scanner')}
              style={{ marginTop: 24, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 16, backgroundColor: accent }}
            >
              <Text style={{ color: 'white', fontWeight: '500' }}>{h.scanNow}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={nonFavoriteScans}
            keyExtractor={(item: HistoryItem) => item.id}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24, paddingTop: 8 }}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
            ListHeaderComponent={renderProSection(scanFavorites, h.myScans, toggleFavorite)}
            renderItem={({ item }: { item: HistoryItem }) => (
              <View style={{ borderRadius: 16, overflow: 'hidden', backgroundColor: bgSecondary, borderWidth: 0.5, borderColor: border }}>
                <ScanResultCard
                  item={item}
                  onToggleFavorite={toggleFavorite}
                  onDelete={(id) => confirmDeleteItem(id, false)}
                />
              </View>
            )}
          />
        )
      )}

      {/* ── TAB: GENERACIONES ── */}
      {activeTab === 'generations' && (
        genLoading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator color={accent} />
          </View>
        ) : isGensEmpty ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
            <Ionicons name="qr-code-outline" size={48} color={textSecondary} />
            <Text style={{ fontSize: 18, fontWeight: '500', marginTop: 16, color: text }}>{h.emptyGenerations}</Text>
            <Text style={{ fontSize: 14, textAlign: 'center', marginTop: 8, color: textSecondary }}>{h.emptyGenerationsDesc}</Text>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/generate')}
              style={{ marginTop: 24, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 16, backgroundColor: accent }}
            >
              <Text style={{ color: 'white', fontWeight: '500' }}>{h.generateNow}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={nonFavoriteGens}
            keyExtractor={(item: GenerationItem) => item.id}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24, paddingTop: 8 }}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
            ListHeaderComponent={renderProSection(genFavorites, h.myGenerations, toggleGenerationFavorite)}
            renderItem={({ item }: { item: GenerationItem }) => (
              <View style={{ borderRadius: 16, overflow: 'hidden', backgroundColor: bgSecondary, borderWidth: 0.5, borderColor: border }}>
                <ScanResultCard
                  item={item as HistoryItem}
                  onToggleFavorite={toggleGenerationFavorite}
                  onDelete={(id) => confirmDeleteItem(id, true)}
                />
              </View>
            )}
          />
        )
      )}

      <BannerAdView />
    </View>
  );
}

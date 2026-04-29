import React, { useState, useMemo, useCallback, useRef } from 'react';
import BannerAdView from '@/components/BannerAdView';
import {
  View, Text, TouchableOpacity, FlatList, Alert, ActivityIndicator, Modal, TextInput,
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
    removeFromHistory, renameItem, reload: reloadHistory,
  } = useHistory();
  const {
    generations, loading: genLoading, clearGenerationHistory,
    toggleGenerationFavorite, removeFromGenerationHistory, renameGenerationItem, reload: reloadGenerations,
  } = useGenerationHistory();
  const { settings } = useAppSettings();
  const isPro = settings.isPro;
  const t = useT();
  const h = t.history;
  const accent = useAccent();

  const [activeTab, setActiveTab] = useState<ActiveTab>('scans');
  const [renameTarget, setRenameTarget] = useState<{ id: string; isGeneration: boolean; current?: string } | null>(null);
  const [renameText, setRenameText] = useState('');
  const renameInputRef = useRef<TextInput>(null);

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

  function openRename(id: string, isGeneration: boolean) {
    const item = isGeneration
      ? generations.find((g) => g.id === id)
      : history.find((h) => h.id === id);
    setRenameText(item?.alias ?? '');
    setRenameTarget({ id, isGeneration, current: item?.alias });
    setTimeout(() => renameInputRef.current?.focus(), 100);
  }

  async function confirmRename() {
    if (!renameTarget) return;
    if (renameTarget.isGeneration) {
      await renameGenerationItem(renameTarget.id, renameText);
    } else {
      await renameItem(renameTarget.id, renameText);
    }
    setRenameTarget(null);
  }

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
    isGeneration: boolean,
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
              onRename={(id) => openRename(id, isGeneration)}
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
            ListHeaderComponent={renderProSection(scanFavorites, h.myScans, toggleFavorite, false)}
            renderItem={({ item }: { item: HistoryItem }) => (
              <View style={{ borderRadius: 16, overflow: 'hidden', backgroundColor: bgSecondary, borderWidth: 0.5, borderColor: border }}>
                <ScanResultCard
                  item={item}
                  onToggleFavorite={toggleFavorite}
                  onDelete={(id) => confirmDeleteItem(id, false)}
                  onRename={(id) => openRename(id, false)}
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
            ListHeaderComponent={renderProSection(genFavorites, h.myGenerations, toggleGenerationFavorite, true)}
            renderItem={({ item }: { item: GenerationItem }) => (
              <View style={{ borderRadius: 16, overflow: 'hidden', backgroundColor: bgSecondary, borderWidth: 0.5, borderColor: border }}>
                <ScanResultCard
                  item={item as HistoryItem}
                  onToggleFavorite={toggleGenerationFavorite}
                  onDelete={(id) => confirmDeleteItem(id, true)}
                  onRename={(id) => openRename(id, true)}
                />
              </View>
            )}
          />
        )
      )}

      <Modal
        visible={!!renameTarget}
        transparent
        animationType="fade"
        onRequestClose={() => setRenameTarget(null)}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24, backgroundColor: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.4)' }}>
          <View style={{ width: '100%', backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF', borderRadius: 20, padding: 24, borderWidth: 0.5, borderColor: border }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: text, marginBottom: 4 }}>{h.renameTitle}</Text>
            <Text style={{ fontSize: 13, color: textSecondary, marginBottom: 16 }}>{h.renameDesc}</Text>
            <TextInput
              ref={renameInputRef}
              value={renameText}
              onChangeText={setRenameText}
              placeholder={h.renamePlaceholder}
              placeholderTextColor={isDark ? '#4A4A45' : '#BBBBB6'}
              returnKeyType="done"
              onSubmitEditing={confirmRename}
              style={{
                backgroundColor: isDark ? '#2A2A2A' : '#F5F5F3',
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 12,
                fontSize: 15,
                color: text,
                marginBottom: 20,
                borderWidth: 0.5,
                borderColor: border,
              }}
            />
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                onPress={() => setRenameTarget(null)}
                style={{ flex: 1, paddingVertical: 13, borderRadius: 12, alignItems: 'center', backgroundColor: isDark ? '#2A2A2A' : '#F0F0EE' }}
                activeOpacity={0.7}
              >
                <Text style={{ fontWeight: '500', color: textSecondary }}>{h.renameCancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmRename}
                style={{ flex: 1, paddingVertical: 13, borderRadius: 12, alignItems: 'center', backgroundColor: accent }}
                activeOpacity={0.85}
              >
                <Text style={{ fontWeight: '600', color: 'white' }}>{h.renameConfirm}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <BannerAdView />
    </View>
  );
}

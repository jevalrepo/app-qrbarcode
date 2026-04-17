import React from 'react';
import {
  View, Text, TouchableOpacity, FlatList, Alert, useColorScheme, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHistory, HistoryItem } from '@/hooks/useHistory';
import { useT, useAccent } from '@/context/SettingsContext';
import ScanResultCard from '@/components/ScanResultCard';

export default function HistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const { history, loading, clearHistory } = useHistory();
  const t = useT();
  const h = t.history;
  const accent = useAccent();

  const bg = isDark ? '#0A0A0A' : '#FFFFFF';
  const bgSecondary = isDark ? '#141414' : '#F5F5F3';
  const border = isDark ? '#2A2A2A' : '#E8E8E6';
  const text = isDark ? '#F5F5F3' : '#0A0A0A';
  const textSecondary = '#888780';

  function confirmClear() {
    Alert.alert(h.confirmTitle, h.confirmMsg, [
      { text: h.cancel, style: 'cancel' },
      { text: h.confirmBtn, style: 'destructive', onPress: clearHistory },
    ]);
  }

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <View style={{ paddingTop: insets.top + 22 }} className="flex-row items-center justify-end px-5 pb-4">
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

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={accent} />
        </View>
      ) : history.length === 0 ? (
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
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item: HistoryItem) => item.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24, paddingTop: 2 }}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          renderItem={({ item }: { item: HistoryItem }) => (
            <View
              className="rounded-2xl overflow-hidden"
              style={{ backgroundColor: bgSecondary, borderWidth: 0.5, borderColor: border }}
            >
              <ScanResultCard item={item} />
            </View>
          )}
        />
      )}
    </View>
  );
}

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { HistoryItem } from '@/hooks/useHistory';
import { getTypeLabel, getTypeIcon, getTypeColor } from '@/lib/detectType';
import { useAccent, useThemeScheme } from '@/context/SettingsContext';

interface Props {
  item: HistoryItem;
  compact?: boolean;
  showDivider?: boolean;
  onToggleFavorite?: (id: string) => void;
}

function timeAgo(ms: number): string {
  const diff = Date.now() - ms;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'ahora';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

export default function ScanResultCard({ item, compact = false, showDivider = false, onToggleFavorite }: Props) {
  const router = useRouter();
  const scheme = useThemeScheme();
  const isDark = scheme === 'dark';
  const accent = useAccent();

  const color = getTypeColor(item.type, accent);
  const icon = getTypeIcon(item.type) as keyof typeof Ionicons.glyphMap;
  const label = getTypeLabel(item.type);

  return (
    <>
      <TouchableOpacity
        onPress={() => router.push({ pathname: '/result', params: { data: item.data, type: item.type } })}
        activeOpacity={0.7}
        className={`flex-row items-center ${compact ? 'px-4 py-3' : 'px-4 py-4'}`}
      >
        <View
          style={{ backgroundColor: color + '2E' }}
          className="w-10 h-10 rounded-xl items-center justify-center mr-3"
        >
          <Ionicons name={icon} size={18} color={color} />
        </View>

        <View className="flex-1 min-w-0">
          <Text
            numberOfLines={1}
            className="text-sm font-medium"
            style={{ color: isDark ? '#F5F5F3' : '#0A0A0A' }}
          >
            {item.data}
          </Text>
          <View className="flex-row items-center mt-0.5 gap-1.5">
            <Text className="text-xs font-medium" style={{ color }}>{label}</Text>
            <Text className="text-xs" style={{ color: '#888780' }}>· {timeAgo(item.scannedAt)}</Text>
          </View>
        </View>

        {onToggleFavorite ? (
          <TouchableOpacity
            onPress={(e) => { e.stopPropagation(); onToggleFavorite(item.id); }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={{ marginLeft: 8 }}
          >
            <Ionicons
              name={item.favorite ? 'star' : 'star-outline'}
              size={16}
              color={item.favorite ? '#EF9F27' : isDark ? '#2A2A2A' : '#EBEBEA'}
            />
          </TouchableOpacity>
        ) : (
          <Ionicons
            name="chevron-forward"
            size={16}
            color={isDark ? '#2A2A2A' : '#EBEBEA'}
            style={{ marginLeft: 8 }}
          />
        )}
      </TouchableOpacity>

      {showDivider && (
        <View className="h-px mx-4" style={{ backgroundColor: isDark ? '#2A2A2A' : '#E8E8E6' }} />
      )}
    </>
  );
}

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { useRouter } from 'expo-router';
import { HistoryItem } from '@/hooks/useHistory';
import { getTypeLabel, getTypeIcon, getTypeColor } from '@/lib/detectType';
import { useAccent, useThemeScheme } from '@/context/SettingsContext';

interface Props {
  item: HistoryItem;
  compact?: boolean;
  showDivider?: boolean;
  onToggleFavorite?: (id: string) => void;
  onDelete?: (id: string) => void;
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

export default function ScanResultCard({ item, compact = false, showDivider = false, onToggleFavorite, onDelete }: Props) {
  const router = useRouter();
  const scheme = useThemeScheme();
  const isDark = scheme === 'dark';
  const accent = useAccent();

  const color = getTypeColor(item.type, accent);
  const label = getTypeLabel(item.type);
  const subtleColor = isDark ? '#3A3A3A' : '#DDDDD8';

  return (
    <>
      <TouchableOpacity
        onPress={() => router.push({ pathname: '/result', params: { data: item.data, type: item.type } })}
        activeOpacity={0.7}
        style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: compact ? 12 : 14 }}
      >
        <View style={{ backgroundColor: isDark ? '#1E1E1E' : '#F0F0EE', borderRadius: 10, padding: 3, marginRight: 12 }}>
          <QRCode value={item.data || ' '} size={34} backgroundColor="transparent" color={isDark ? '#F5F5F3' : '#0A0A0A'} />
        </View>

        <View style={{ flex: 1, minWidth: 0 }}>
          <Text numberOfLines={1} style={{ fontSize: 14, fontWeight: '500', color: isDark ? '#F5F5F3' : '#0A0A0A' }}>
            {item.data}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2, gap: 6 }}>
            <Text style={{ fontSize: 12, fontWeight: '500', color }}>{label}</Text>
            <Text style={{ fontSize: 12, color: '#888780' }}>· {timeAgo(item.scannedAt)}</Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: 8 }}>
          {onToggleFavorite && (
            <TouchableOpacity
              onPress={(e) => { e.stopPropagation(); onToggleFavorite(item.id); }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={{ padding: 4 }}
            >
              <Ionicons
                name={item.favorite ? 'star' : 'star-outline'}
                size={16}
                color={item.favorite ? '#EF9F27' : subtleColor}
              />
            </TouchableOpacity>
          )}
          {onDelete ? (
            <TouchableOpacity
              onPress={(e) => { e.stopPropagation(); onDelete(item.id); }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={{ padding: 4 }}
            >
              <Ionicons name="trash-outline" size={16} color={isDark ? '#555550' : '#C0C0BA'} />
            </TouchableOpacity>
          ) : (
            !onToggleFavorite && <Ionicons name="chevron-forward" size={16} color={subtleColor} />
          )}
        </View>
      </TouchableOpacity>

      {showDivider && (
        <View style={{ height: 1, marginHorizontal: 16, backgroundColor: isDark ? '#2A2A2A' : '#E8E8E6' }} />
      )}
    </>
  );
}

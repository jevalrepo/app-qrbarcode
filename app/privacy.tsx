import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppSettings, useThemeScheme } from '@/context/SettingsContext';
import { privacyContent } from '@/lib/privacyContent';

export default function PrivacyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scheme = useThemeScheme();
  const isDark = scheme === 'dark';
  const { settings } = useAppSettings();
  const policy = privacyContent[settings.language];

  const bg          = isDark ? '#0A0A0A' : '#FFFFFF';
  const bgSecondary = isDark ? '#141414' : '#F5F5F3';
  const border      = isDark ? '#2A2A2A' : '#E8E8E6';
  const text        = isDark ? '#F5F5F3' : '#0A0A0A';
  const textSecondary = '#888780';

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      {/* header */}
      <View
        style={{
          paddingTop: insets.top + 16,
          paddingBottom: 14,
          paddingHorizontal: 20,
          backgroundColor: bg,
          borderBottomWidth: 0.5,
          borderBottomColor: border,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: text }}>{policy.title}</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 36, height: 36, borderRadius: 18,
              backgroundColor: isDark ? '#1E1E1E' : '#EBEBEA',
              alignItems: 'center', justifyContent: 'center',
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={18} color={textSecondary} />
          </TouchableOpacity>
        </View>
        <Text style={{ fontSize: 12, color: textSecondary, marginTop: 4 }}>{policy.lastUpdated}</Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* intro */}
        <View
          style={{
            backgroundColor: bgSecondary,
            borderRadius: 16,
            borderWidth: 0.5,
            borderColor: border,
            padding: 16,
            marginBottom: 20,
          }}
        >
          <Text style={{ fontSize: 13, color: text, lineHeight: 21 }}>{policy.intro}</Text>
        </View>

        {/* sections */}
        {policy.sections.map((section, i) => (
          <View key={i} style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: text, marginBottom: 8 }}>
              {section.title}
            </Text>
            <View
              style={{
                backgroundColor: bgSecondary,
                borderRadius: 16,
                borderWidth: 0.5,
                borderColor: border,
                padding: 16,
              }}
            >
              <Text style={{ fontSize: 13, color: textSecondary, lineHeight: 21 }}>
                {section.body}
              </Text>
            </View>
          </View>
        ))}

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

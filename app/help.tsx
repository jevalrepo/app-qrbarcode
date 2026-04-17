import React, { useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useT, useAccent, useThemeScheme } from '@/context/SettingsContext';
import { helpContent, HelpSection } from '@/lib/helpContent';
import { useAppSettings } from '@/context/SettingsContext';

export default function HelpScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scheme = useThemeScheme();
  const isDark = scheme === 'dark';
  const t = useT();
  const accent = useAccent();
  const { settings } = useAppSettings();
  const sections: HelpSection[] = helpContent[settings.language];

  const [activeSection, setActiveSection] = useState(sections[0].id);
  const scrollRef = useRef<ScrollView>(null);
  const chipsRef = useRef<ScrollView>(null);
  const sectionOffsets = useRef<Record<string, number>>({});

  const bg          = isDark ? '#0A0A0A' : '#FFFFFF';
  const bgSecondary = isDark ? '#141414' : '#F5F5F3';
  const border      = isDark ? '#2A2A2A' : '#E8E8E6';
  const text        = isDark ? '#F5F5F3' : '#0A0A0A';
  const textSecondary = '#888780';

  function scrollToSection(id: string) {
    const offset = sectionOffsets.current[id];
    if (offset !== undefined) {
      scrollRef.current?.scrollTo({ y: offset - 16, animated: true });
    }
    setActiveSection(id);
  }

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      {/* sticky header */}
      <View
        style={{
          paddingTop: insets.top + 16,
          paddingBottom: 12,
          paddingHorizontal: 20,
          backgroundColor: bg,
          borderBottomWidth: 0.5,
          borderBottomColor: border,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: text }}>{t.help.title}</Text>
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

        {/* index chips */}
        <ScrollView
          ref={chipsRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginHorizontal: -20 }}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 8, flexDirection: 'row' }}
        >
          {sections.map((s) => {
            const active = activeSection === s.id;
            return (
              <TouchableOpacity
                key={s.id}
                onPress={() => scrollToSection(s.id)}
                style={{
                  flexDirection: 'row', alignItems: 'center', gap: 6,
                  paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20,
                  backgroundColor: active ? s.color + '20' : isDark ? '#1E1E1E' : '#EBEBEA',
                  borderWidth: 0.5,
                  borderColor: active ? s.color : border,
                }}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={s.icon as keyof typeof Ionicons.glyphMap}
                  size={13}
                  color={active ? s.color : textSecondary}
                />
                <Text style={{ fontSize: 12, fontWeight: '500', color: active ? s.color : textSecondary }}>
                  {s.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* content */}
      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingVertical: 20, paddingHorizontal: 20 }}
        showsVerticalScrollIndicator={false}
        onScroll={(e) => {
          const y = e.nativeEvent.contentOffset.y;
          let current = sections[0].id;
          for (const s of sections) {
            const offset = sectionOffsets.current[s.id];
            if (offset !== undefined && y >= offset - 60) current = s.id;
          }
          if (current !== activeSection) setActiveSection(current);
        }}
        scrollEventThrottle={16}
      >
        {sections.map((section, si) => (
          <View
            key={section.id}
            style={{ marginBottom: 24 }}
            onLayout={(e) => {
              sectionOffsets.current[section.id] = e.nativeEvent.layout.y;
            }}
          >
            {/* section header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <View
                style={{
                  width: 36, height: 36, borderRadius: 10,
                  backgroundColor: section.color + '20',
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Ionicons
                  name={section.icon as keyof typeof Ionicons.glyphMap}
                  size={18}
                  color={section.color}
                />
              </View>
              <Text style={{ fontSize: 16, fontWeight: '600', color: text }}>{section.title}</Text>
            </View>

            {/* items */}
            <View
              style={{
                backgroundColor: bgSecondary,
                borderRadius: 16,
                borderWidth: 0.5,
                borderColor: border,
                overflow: 'hidden',
              }}
            >
              {section.items.map((item, i) => {
                const isArrow = item.startsWith('→');
                return (
                  <View
                    key={i}
                    style={{
                      flexDirection: 'row',
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      borderBottomWidth: i < section.items.length - 1 ? 0.5 : 0,
                      borderBottomColor: border,
                      alignItems: 'flex-start',
                      gap: 10,
                    }}
                  >
                    {isArrow ? (
                      <View style={{ width: 20, alignItems: 'center', marginTop: 1 }}>
                        <Text style={{ color: section.color, fontSize: 13, fontWeight: '600' }}>→</Text>
                      </View>
                    ) : (
                      <View
                        style={{
                          width: 6, height: 6, borderRadius: 3,
                          backgroundColor: section.color,
                          marginTop: 6, flexShrink: 0,
                        }}
                      />
                    )}
                    <Text style={{ flex: 1, fontSize: 13, color: isArrow ? textSecondary : text, lineHeight: 20 }}>
                      {isArrow ? item.slice(2) : item}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

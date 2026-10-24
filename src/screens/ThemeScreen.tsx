import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
} from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { THEMES, ACCENTS, ThemeKey, AccentKey } from '@/theme/themes';
import Toast from 'react-native-toast-message';

export default function ThemeScreen() {
  const { theme, themeKey, accentKey, setTheme, setAccent, toggleCompact, toggleAvatars } = useTheme();
  const T = theme;

  const handleSetTheme = (key: ThemeKey) => {
    setTheme(key);
    Toast.show({ type: 'success', text1: `${THEMES[key].emoji} ${THEMES[key].label} theme applied` });
  };

  const handleSetAccent = (key: AccentKey) => {
    setAccent(key);
    Toast.show({ type: 'success', text1: '🎨 Accent updated' });
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: T.background }}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Theme Presets ── */}
      <Text style={[styles.sectionLabel, { color: T.textMuted }]}>App Theme</Text>
      <View style={styles.themeGrid}>
        {(Object.keys(THEMES) as ThemeKey[]).map(key => {
          const t = THEMES[key];
          const active = key === themeKey;
          return (
            <TouchableOpacity
              key={key}
              onPress={() => handleSetTheme(key)}
              style={[
                styles.themeSwatch,
                { backgroundColor: t.background, borderColor: active ? T.accent : t.border },
              ]}
              activeOpacity={0.8}
            >
              <Text style={styles.themeIcon}>{t.emoji}</Text>
              <Text style={[styles.themeLabel, { color: t.textPrimary }]}>{t.label}</Text>
              {active && (
                <View style={[styles.activeCheck, { backgroundColor: T.accent }]}>
                  <Text style={{ color: '#fff', fontSize: 10 }}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── Accent Color ── */}
      <Text style={[styles.sectionLabel, { color: T.textMuted }]}>Accent Color</Text>
      <View style={styles.accentRow}>
        {(Object.keys(ACCENTS) as AccentKey[]).map(key => {
          const a = ACCENTS[key];
          const active = key === accentKey;
          return (
            <TouchableOpacity
              key={key}
              onPress={() => handleSetAccent(key)}
              style={[
                styles.accentDot,
                { backgroundColor: a.color, borderColor: active ? '#fff' : 'transparent' },
              ]}
              activeOpacity={0.8}
            />
          );
        })}
      </View>

      {/* ── Options ── */}
      <Text style={[styles.sectionLabel, { color: T.textMuted }]}>Options</Text>
      <View style={[styles.optCard, { backgroundColor: T.card, borderColor: T.border }]}>
        <View style={[styles.optRow, { borderBottomColor: T.border }]}>
          <View>
            <Text style={[styles.optLabel, { color: T.textPrimary }]}>Compact Cards</Text>
            <Text style={[styles.optSub, { color: T.textSecondary }]}>Smaller friend cards in lists</Text>
          </View>
          <Switch
            value={T.compact}
            onValueChange={toggleCompact}
            trackColor={{ false: T.border, true: T.accent }}
            thumbColor="#fff"
          />
        </View>
        <View style={styles.optRow}>
          <View>
            <Text style={[styles.optLabel, { color: T.textPrimary }]}>Show Avatars</Text>
            <Text style={[styles.optSub, { color: T.textSecondary }]}>Letter avatars on friend cards</Text>
          </View>
          <Switch
            value={T.showAvatars}
            onValueChange={toggleAvatars}
            trackColor={{ false: T.border, true: T.accent }}
            thumbColor="#fff"
          />
        </View>
      </View>

      {/* ── Live Preview ── */}
      <Text style={[styles.sectionLabel, { color: T.textMuted }]}>Live Preview</Text>
      <View style={[styles.previewCard, { backgroundColor: T.card, borderColor: T.border, padding: T.compact ? 10 : 14 }]}>
        {T.showAvatars && (
          <View style={[styles.previewAvatar, { backgroundColor: T.busy + '22' }]}>
            <Text style={{ color: T.busy, fontWeight: '800', fontSize: T.compact ? 14 : 17 }}>A</Text>
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: T.compact ? 13 : 15, fontWeight: '700', color: T.textPrimary }}>Ayesha</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 }}>
            <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: T.busy }} />
            <Text style={{ fontSize: 12, color: T.textSecondary }}>📚 In Class</Text>
          </View>
        </View>
        <View style={[styles.previewBadge, { backgroundColor: T.busy + '22' }]}>
          <Text style={{ fontSize: 11, fontWeight: '700', color: T.busy }}>Busy</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 60 },
  sectionLabel: {
    fontSize: 11, fontWeight: '700', letterSpacing: 0.7,
    textTransform: 'uppercase', marginBottom: 12, marginTop: 8,
  },
  themeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  themeSwatch: {
    width: '22%', aspectRatio: 1, borderRadius: 14, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center', gap: 4, position: 'relative',
  },
  themeIcon: { fontSize: 20 },
  themeLabel: { fontSize: 9, fontWeight: '700' },
  activeCheck: {
    position: 'absolute', top: 4, right: 4,
    width: 16, height: 16, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  accentRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  accentDot: { width: 36, height: 36, borderRadius: 18, borderWidth: 3 },
  optCard: { borderRadius: 16, borderWidth: 1, marginBottom: 24, paddingHorizontal: 16 },
  optRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 14, borderBottomWidth: 1,
  },
  optLabel: { fontSize: 14, fontWeight: '600' },
  optSub: { fontSize: 12, marginTop: 2 },
  previewCard: {
    borderRadius: 14, borderWidth: 1, flexDirection: 'row',
    alignItems: 'center', gap: 11,
  },
  previewAvatar: {
    width: 42, height: 42, borderRadius: 21,
    alignItems: 'center', justifyContent: 'center',
  },
  previewBadge: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 20 },
});

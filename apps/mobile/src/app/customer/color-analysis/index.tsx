import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import type { JSX } from 'react';
import { useRouter } from 'expo-router';
import type { TranslationKey } from '@galaxy/shared';
import { useLocale } from '@/components/LocaleProvider';

interface SeasonPalette {
  key: string;
  emoji: string;
  nameKey: TranslationKey;
  descKey: TranslationKey;
  colors: string[];
  skinKey: TranslationKey;
  makeupKeys: TranslationKey[];
  jewelryKey: TranslationKey;
}

const SEASONS_COLORS: SeasonPalette[] = [
  {
    key: 'winter',
    emoji: '❄️',
    nameKey: 'color.season.winter',
    descKey: 'color.desc.winter',
    colors: ['#1e1b4b', '#312e81', '#831843', '#ffffff', '#000000', '#dc2626', '#4c1d95'],
    skinKey: 'color.skin.winter',
    makeupKeys: ['color.makeup.winter1', 'color.makeup.winter2', 'color.makeup.winter3'],
    jewelryKey: 'color.jewelry.silver',
  },
  {
    key: 'summer',
    emoji: '☀️',
    nameKey: 'color.season.summer',
    descKey: 'color.desc.summer',
    colors: ['#fbcfe8', '#ddd6fe', '#bfdbfe', '#d1d5db', '#ec4899', '#8b5cf6', '#93c5fd'],
    skinKey: 'color.skin.summer',
    makeupKeys: ['color.makeup.summer1', 'color.makeup.summer2', 'color.makeup.summer3'],
    jewelryKey: 'color.jewelry.silver',
  },
  {
    key: 'autumn',
    emoji: '🍂',
    nameKey: 'color.season.autumn',
    descKey: 'color.desc.autumn',
    colors: ['#fef3c7', '#fed7aa', '#fde68a', '#d97706', '#b45309', '#92400e', '#78350f'],
    skinKey: 'color.skin.autumn',
    makeupKeys: ['color.makeup.autumn1', 'color.makeup.autumn2', 'color.makeup.autumn3'],
    jewelryKey: 'color.jewelry.gold',
  },
  {
    key: 'spring',
    emoji: '🌸',
    nameKey: 'color.season.spring',
    descKey: 'color.desc.spring',
    colors: ['#fef08a', '#fde047', '#86efac', '#fca5a5', '#fb923c', '#22c55e', '#fbbf24'],
    skinKey: 'color.skin.spring',
    makeupKeys: ['color.makeup.spring1', 'color.makeup.spring2', 'color.makeup.spring3'],
    jewelryKey: 'color.jewelry.gold',
  },
];

export default function ColorAnalysisScreen(): JSX.Element {
  const router = useRouter();
  const { t } = useLocale();
  const [season, setSeason] = useState('summer');
  const s = SEASONS_COLORS.find((x) => x.key === season)!;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>{t('colorAnalysis.title')}</Text>
      <Text style={styles.sub}>{t('colorAnalysis.subtitle')}</Text>

      <View style={styles.tabs}>
        {SEASONS_COLORS.map((sc) => (
          <TouchableOpacity
            key={sc.key}
            onPress={() => setSeason(sc.key)}
            style={[styles.tb, season === sc.key && styles.tbA]}
          >
            <Text style={styles.tbe}>{sc.emoji}</Text>
            <Text style={[styles.tbn, season === sc.key && styles.tbnA]}>{t(sc.nameKey)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.ct}>
          {s.emoji} {t(s.nameKey)} — {t(s.descKey)}
        </Text>
        <Text style={styles.cs}> {t(s.skinKey)}</Text>

        <Text style={styles.st}>{t('colorAnalysis.palette')}</Text>
        <View style={styles.palette}>
          {s.colors.map((c, i) => (
            <View key={i} style={[styles.swatch, { backgroundColor: c }]} />
          ))}
        </View>

        <Text style={styles.st}>{t('colorAnalysis.makeup')}</Text>
        {s.makeupKeys.map((m, i) => (
          <View key={i} style={styles.makeupItem}>
            <Text style={styles.makeupEmoji}>💄</Text>
            <Text style={styles.makeupText}>{t(m)}</Text>
          </View>
        ))}

        <View style={styles.jewelryRow}>
          <Text style={styles.jewelryLabel}>{t('colorAnalysis.jewelry')}</Text>
          <Text style={styles.jewelryValue}>{t(s.jewelryKey)}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.btn}
        onPress={() => router.push('/customer/skin-analysis' as never)}
      >
        <Text style={styles.bt}>{t('colorAnalysis.analyze')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#db2777', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  tabs: { flexDirection: 'row', gap: 6, marginBottom: 20 },
  tb: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  tbA: { borderColor: '#db2777', backgroundColor: '#fdf2f8' },
  tbe: { fontSize: 20 },
  tbn: { fontSize: 10, fontWeight: '600', color: '#6b7280', marginTop: 2 },
  tbnA: { color: '#db2777' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16 },
  ct: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 4 },
  cs: { fontSize: 13, color: '#6b7280', marginBottom: 12 },
  st: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 10, marginTop: 12 },
  palette: { flexDirection: 'row', gap: 6, marginBottom: 12 },
  swatch: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: '#e5e7eb' },
  makeupItem: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  makeupEmoji: { fontSize: 16 },
  makeupText: { fontSize: 13, color: '#374151' },
  jewelryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  jewelryLabel: { fontSize: 14, color: '#6b7280' },
  jewelryValue: { fontSize: 16, fontWeight: '700', color: '#f59e0b' },
  btn: {
    backgroundColor: '#db2777',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  bt: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

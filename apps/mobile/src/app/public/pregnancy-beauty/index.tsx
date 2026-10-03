import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import type { JSX } from 'react';
import type { TranslationKey } from '@galaxy/shared';
import { useLocale } from '@/components/LocaleProvider';

interface TrimesterCard {
  key: string;
  emoji: string;
  nameKey: TranslationKey;
  weeks: string;
  color: string;
  tips: TranslationKey[];
  safe: TranslationKey[];
  avoid: TranslationKey[];
}

const TRIMESTERS: TrimesterCard[] = [
  {
    key: 'first',
    emoji: '🌱',
    nameKey: 'mobile.public.pregnancyBeauty.trimester.first',
    weeks: '1-13',
    color: '#10b981',
    tips: [
      'mobile.public.pregnancyBeauty.first.tip1',
      'marketing.pregnancy-beauty.tip-natural-title',
      'mobile.public.pregnancyBeauty.first.tip3',
    ],
    safe: [
      'mobile.public.pregnancyBeauty.first.safe1',
      'mobile.public.pregnancyBeauty.first.safe2',
      'mobile.public.pregnancyBeauty.first.safe3',
      'mobile.public.pregnancyBeauty.first.safe4',
    ],
    avoid: [
      'mobile.public.pregnancyBeauty.first.avoid1',
      'mobile.public.pregnancyBeauty.first.avoid2',
      'mobile.public.pregnancyBeauty.first.avoid3',
      'mobile.public.pregnancyBeauty.first.avoid4',
    ],
  },
  {
    key: 'second',
    emoji: '🌸',
    nameKey: 'mobile.public.pregnancyBeauty.trimester.second',
    weeks: '14-26',
    color: '#8b5cf6',
    tips: [
      'mobile.public.pregnancyBeauty.second.tip1',
      'mobile.public.pregnancyBeauty.second.tip2',
      'mobile.public.pregnancyBeauty.second.tip3',
    ],
    safe: [
      'marketing.shop-the-look.service-manicure-pedicure',
      'mobile.public.pregnancyBeauty.second.safe2',
      'mobile.public.pregnancyBeauty.second.safe3',
      'mobile.public.pregnancyBeauty.second.safe4',
    ],
    avoid: [
      'mobile.public.pregnancyBeauty.second.avoid1',
      'mobile.public.pregnancyBeauty.second.avoid2',
      'marketing.pregnancy-beauty.ing-avoid-essential-oils',
    ],
  },
  {
    key: 'third',
    emoji: '🌟',
    nameKey: 'mobile.public.pregnancyBeauty.trimester.third',
    weeks: '27-40',
    color: '#ec4899',
    tips: [
      'mobile.public.pregnancyBeauty.third.tip1',
      'mobile.public.pregnancyBeauty.third.tip2',
      'mobile.public.pregnancyBeauty.third.tip3',
    ],
    safe: [
      'marketing.beauty-quiz.svc-pedicure',
      'beautyServices.prosDeepHydration',
      'mobile.public.pregnancyBeauty.third.safe3',
      'mobile.public.pregnancyBeauty.third.safe4',
    ],
    avoid: [
      'mobile.public.pregnancyBeauty.third.avoid1',
      'mobile.public.pregnancyBeauty.third.avoid2',
      'mobile.public.pregnancyBeauty.third.avoid3',
    ],
  },
];

export default function PregnancyBeautyScreen(): JSX.Element {
  const { t } = useLocale();
  const [trimester, setTrimester] = useState('second');

  const current = TRIMESTERS.find((x) => x.key === trimester)!;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>{t('mobile.public.pregnancy-beauty.title')}</Text>
      <Text style={styles.sub}>{t('mobile.public.pregnancy-beauty.subtitle')}</Text>

      <View style={styles.tabs}>
        {TRIMESTERS.map((tr) => (
          <TouchableOpacity
            key={tr.key}
            onPress={() => setTrimester(tr.key)}
            style={[styles.tab, trimester === tr.key && { backgroundColor: tr.color }]}
          >
            <Text style={[styles.tabText, trimester === tr.key && { color: '#fff' }]}>
              {tr.emoji} {t(tr.nameKey)}
            </Text>
            <Text style={[styles.tabWeeks, trimester === tr.key && { color: '#fff' }]}>
              {t('mobile.public.pregnancy-beauty.weeks', { weeks: tr.weeks })}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={[styles.card, { borderColor: current.color }]}>
        <Text style={styles.cardTitle}>{t('mobile.public.pregnancy-beauty.tips')}</Text>
        {current.tips.map((tip, i) => (
          <View key={i} style={styles.row}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.text}>{t(tip)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={[styles.cardTitle, { color: '#059669' }]}>
          {t('mobile.public.pregnancy-beauty.safe')}
        </Text>
        <View style={styles.grid}>
          {current.safe.map((s, i) => (
            <View key={i} style={styles.chip}>
              <Text style={styles.chipText}> {t(s)}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={[styles.cardTitle, { color: '#dc2626' }]}>
          {t('mobile.public.pregnancy-beauty.avoid')}
        </Text>
        <View style={styles.grid}>
          {current.avoid.map((s, i) => (
            <View key={i} style={[styles.chip, styles.chipAvoid]}>
              <Text style={[styles.chipText, { color: '#dc2626' }]}> {t(s)}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#f0fdf4' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#059669', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  tabs: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  tab: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  tabText: { fontSize: 13, fontWeight: '700', color: '#111827' },
  tabWeeks: { fontSize: 10, color: '#6b7280', marginTop: 2 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 6 },
  bullet: { fontSize: 16, color: '#059669' },
  text: { fontSize: 13, color: '#374151', flex: 1, textAlign: 'right' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { backgroundColor: '#dcfce7', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
  chipAvoid: { backgroundColor: '#fee2e2' },
  chipText: { fontSize: 12, fontWeight: '600' },
});

import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import type { JSX } from 'react';
import { useRouter } from 'expo-router';
import type { TranslationKey } from '@galaxy/shared';
import { useLocale } from '@/components/LocaleProvider';

interface SeasonService {
  emoji: string;
  nameKey: TranslationKey;
  whyKey: TranslationKey;
}

interface Season {
  key: string;
  emoji: string;
  nameKey: TranslationKey;
  monthsKey: TranslationKey;
  color: string;
  tipKey: TranslationKey;
  services: SeasonService[];
}

const SEASONS: Season[] = [
  {
    key: 'winter',
    emoji: '❄️',
    nameKey: 'seasonal.season.winter',
    monthsKey: 'seasonal.months.winter',
    color: '#3b82f6',
    tipKey: 'seasonal.tips.winter',
    services: [
      {
        emoji: '💧',
        nameKey: 'seasonal.svc.winter.deepHydration',
        whyKey: 'seasonal.svc.winter.deepHydrationWhy',
      },
      {
        emoji: '💆',
        nameKey: 'seasonal.svc.winter.oilMassage',
        whyKey: 'seasonal.svc.winter.oilMassageWhy',
      },
      {
        emoji: '💇',
        nameKey: 'seasonal.svc.winter.hairTreatment',
        whyKey: 'seasonal.svc.winter.hairTreatmentWhy',
      },
      {
        emoji: '💅',
        nameKey: 'seasonal.svc.winter.winterNails',
        whyKey: 'seasonal.svc.winter.winterNailsWhy',
      },
    ],
  },
  {
    key: 'spring',
    emoji: '🌸',
    nameKey: 'seasonal.season.spring',
    monthsKey: 'seasonal.months.spring',
    color: '#ec4899',
    tipKey: 'seasonal.tips.spring',
    services: [
      {
        emoji: '✨',
        nameKey: 'seasonal.svc.spring.exfoliation',
        whyKey: 'seasonal.svc.spring.exfoliationWhy',
      },
      {
        emoji: '✂️',
        nameKey: 'seasonal.svc.spring.hairTrim',
        whyKey: 'seasonal.svc.spring.hairTrimWhy',
      },
      {
        emoji: '💄',
        nameKey: 'seasonal.svc.spring.springMakeup',
        whyKey: 'seasonal.svc.spring.springMakeupWhy',
      },
      {
        emoji: '🌿',
        nameKey: 'seasonal.svc.spring.naturalTreatments',
        whyKey: 'seasonal.svc.spring.naturalTreatmentsWhy',
      },
    ],
  },
  {
    key: 'summer',
    emoji: '☀️',
    nameKey: 'seasonal.season.summer',
    monthsKey: 'seasonal.months.summer',
    color: '#f59e0b',
    tipKey: 'seasonal.tips.summer',
    services: [
      {
        emoji: '🧴',
        nameKey: 'seasonal.svc.summer.medicalSunscreen',
        whyKey: 'seasonal.svc.summer.medicalSunscreenWhy',
      },
      {
        emoji: '🦶',
        nameKey: 'seasonal.svc.summer.summerPedicure',
        whyKey: 'seasonal.svc.summer.summerPedicureWhy',
      },
      {
        emoji: '🪒',
        nameKey: 'seasonal.svc.summer.hairRemoval',
        whyKey: 'seasonal.svc.summer.hairRemovalWhy',
      },
      {
        emoji: '💇',
        nameKey: 'seasonal.svc.summer.summerHairstyles',
        whyKey: 'seasonal.svc.summer.summerHairstylesWhy',
      },
    ],
  },
  {
    key: 'autumn',
    emoji: '🍂',
    nameKey: 'seasonal.season.autumn',
    monthsKey: 'seasonal.months.autumn',
    color: '#d97706',
    tipKey: 'seasonal.tips.autumn',
    services: [
      {
        emoji: '🍋',
        nameKey: 'seasonal.svc.autumn.pigmentation',
        whyKey: 'seasonal.svc.autumn.pigmentationWhy',
      },
      {
        emoji: '💆',
        nameKey: 'seasonal.svc.autumn.relaxingMassage',
        whyKey: 'seasonal.svc.autumn.relaxingMassageWhy',
      },
      {
        emoji: '💇',
        nameKey: 'seasonal.svc.winter.hairTreatment',
        whyKey: 'seasonal.svc.autumn.hairTreatmentWhy',
      },
      {
        emoji: '🧖',
        nameKey: 'seasonal.svc.autumn.nourishingMask',
        whyKey: 'seasonal.svc.autumn.nourishingMaskWhy',
      },
    ],
  },
];

export default function SeasonalCalendarScreen(): JSX.Element {
  const { t } = useLocale();
  const router = useRouter();
  const [season, setSeason] = useState('summer');
  const s = SEASONS.find((x) => x.key === season)!;

  return (
    <ScrollView
      style={[styles.c, { backgroundColor: s.color + '10' }]}
      contentContainerStyle={styles.i}
    >
      <Text style={[styles.t, { color: s.color }]}>{t('mobile.seasonalCalendar.title')}</Text>
      <Text style={styles.sub}>{t('mobile.seasonalCalendar.subtitle')}</Text>

      <View style={styles.tabs}>
        {SEASONS.map((se) => (
          <TouchableOpacity
            key={se.key}
            onPress={() => setSeason(se.key)}
            style={[styles.tb, season === se.key && { backgroundColor: se.color }]}
          >
            <Text style={[styles.tbe, season === se.key && { color: '#fff' }]}>{se.emoji}</Text>
            <Text style={[styles.tbn, season === se.key && { color: '#fff' }]}>
              {t(se.nameKey)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={[styles.card, { borderLeftColor: s.color }]}>
        <Text style={styles.cardEmoji}>{s.emoji}</Text>
        <Text style={styles.cardTitle}>
          {t(s.nameKey)} — {t(s.monthsKey)}
        </Text>
        <Text style={styles.cardTip}> {t(s.tipKey)}</Text>
      </View>

      <Text style={styles.st}>{t('mobile.seasonalCalendar.season-services')}</Text>
      {s.services.map((sv, i) => (
        <View key={i} style={styles.svc}>
          <Text style={styles.se}>{sv.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.sn}>{t(sv.nameKey)}</Text>
            <Text style={styles.sw}>{t(sv.whyKey)}</Text>
          </View>
        </View>
      ))}

      <TouchableOpacity
        style={[styles.btn, { backgroundColor: s.color }]}
        onPress={() => router.push('/customer/bookings/create' as never)}
      >
        <Text style={styles.bt}>{t('mobile.seasonalCalendar.book')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1 },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', textAlign: 'center', marginBottom: 4 },
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
  tbe: { fontSize: 20 },
  tbn: { fontSize: 10, fontWeight: '600', color: '#6b7280', marginTop: 2 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
  },
  cardEmoji: { fontSize: 40 },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginTop: 8 },
  cardTip: { fontSize: 13, color: '#6b7280', marginTop: 8, lineHeight: 20 },
  st: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 10 },
  svc: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 6,
  },
  se: { fontSize: 30 },
  sn: { fontSize: 14, fontWeight: '600', color: '#111827' },
  sw: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  btn: { borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 12 },
  bt: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { useLocale } from '@/components/LocaleProvider';
import type { TranslationKey } from '@galaxy/shared';

// NO API: post-treatment care guides are static content (TREATMENTS map),
// identical to the web page — no procedure serves aftercare/timeline data.
const TREATMENTS: Record<
  string,
  { emoji: string; aftercare: string[]; timeline: { day: string; action: string }[] }
> = {
  facial: {
    emoji: '',
    aftercare: [
      'mobile.postTreatment.aftercare-facial-1',
      'mobile.postTreatment.aftercare-facial-2',
      'mobile.postTreatment.aftercare-facial-3',
      'mobile.postTreatment.aftercare-facial-4',
    ],
    timeline: [
      { day: 'mobile.postTreatment.day-1', action: 'mobile.postTreatment.action-facial-day-1' },
      { day: 'mobile.postTreatment.day-2-3', action: 'mobile.postTreatment.action-facial-day-2-3' },
      { day: 'mobile.postTreatment.day-4-7', action: 'mobile.postTreatment.action-facial-day-4-7' },
    ],
  },
  waxing: {
    emoji: '️',
    aftercare: [
      'mobile.postTreatment.aftercare-waxing-1',
      'mobile.postTreatment.aftercare-waxing-2',
      'mobile.postTreatment.aftercare-waxing-3',
      'mobile.postTreatment.aftercare-waxing-4',
    ],
    timeline: [
      { day: 'mobile.postTreatment.day-1', action: 'mobile.postTreatment.action-waxing-day-1' },
      {
        day: 'mobile.postTreatment.day-2-3',
        action: 'mobile.postTreatment.action-waxing-day-2-3',
      },
      {
        day: 'mobile.postTreatment.day-4-plus',
        action: 'mobile.postTreatment.action-waxing-day-4-plus',
      },
    ],
  },
  hair_color: {
    emoji: '‍️',
    aftercare: [
      'mobile.postTreatment.aftercare-hair-color-1',
      'mobile.postTreatment.aftercare-hair-color-2',
      'mobile.postTreatment.aftercare-hair-color-3',
      'mobile.postTreatment.aftercare-hair-color-4',
    ],
    timeline: [
      {
        day: 'mobile.postTreatment.day-1-2',
        action: 'mobile.postTreatment.action-hair-color-day-1-2',
      },
      {
        day: 'mobile.postTreatment.day-3-5',
        action: 'mobile.postTreatment.action-hair-color-day-3-5',
      },
      {
        day: 'mobile.postTreatment.day-6-plus',
        action: 'mobile.postTreatment.action-hair-color-day-6-plus',
      },
    ],
  },
  nails: {
    emoji: '',
    aftercare: [
      'mobile.postTreatment.aftercare-nails-1',
      'mobile.postTreatment.aftercare-nails-2',
      'mobile.postTreatment.aftercare-nails-3',
      'mobile.postTreatment.aftercare-nails-4',
    ],
    timeline: [
      { day: 'mobile.postTreatment.day-1', action: 'mobile.postTreatment.action-nails-day-1' },
      { day: 'mobile.postTreatment.day-2-7', action: 'mobile.postTreatment.action-nails-day-2-7' },
      {
        day: 'mobile.postTreatment.week-2-plus',
        action: 'mobile.postTreatment.action-nails-week-2-plus',
      },
    ],
  },
};

export default function PostTreatmentScreen(): JSX.Element {
  const { t } = useLocale();
  const [selected, setSelected] = useState('facial');
  const [completed, setCompleted] = useState<string[]>([]);

  const treatment = TREATMENTS[selected]!;
  const progress = Math.round((completed.length / treatment.timeline.length) * 100);

  const toggleDay = (day: string) => {
    if (completed.includes(day)) setCompleted(completed.filter((x) => x !== day));
    else setCompleted([...completed, day]);
  };

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>{t('mobile.postTreatment.title')}</Text>
      <Text style={styles.sub}>{t('mobile.postTreatment.subtitle')}</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {Object.entries(TREATMENTS).map(([key, val]) => (
            <TouchableOpacity
              key={key}
              onPress={() => {
                setSelected(key);
                setCompleted([]);
              }}
              style={[styles.tab, selected === key && styles.tabA]}
            >
              <Text style={styles.te}>{val.emoji}</Text>
              <Text style={[styles.tn, selected === key && styles.tnA]}>
                {key === 'facial'
                  ? t('mobile.postTreatment.tab-facial')
                  : key === 'waxing'
                    ? t('mobile.postTreatment.tab-waxing')
                    : key === 'hair_color'
                      ? t('mobile.postTreatment.tab-hair-color')
                      : t('mobile.postTreatment.tab-nails')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.progress}>
        <Text style={styles.progressText}>{t('mobile.postTreatment.progress', { progress })}</Text>
        <View style={styles.bar}>
          <View style={[styles.fill, { width: `${progress}%` }]} />
        </View>
      </View>

      <Text style={styles.st}>{t('mobile.postTreatment.instructions')}</Text>
      <View style={styles.card}>
        {treatment.aftercare.map((a, i) => (
          <View key={i} style={styles.ac}>
            <Text style={styles.acb}></Text>
            <Text style={styles.act}>{t(a as TranslationKey)}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.st}>{t('mobile.postTreatment.timeline')}</Text>
      {treatment.timeline.map((tl) => {
        const isDone = completed.includes(tl.day);
        return (
          <TouchableOpacity
            key={tl.day}
            onPress={() => toggleDay(tl.day)}
            style={[styles.tl, isDone && styles.tlDone]}
          >
            <View style={[styles.tlc, isDone && styles.tlcDone]}>
              <Text style={styles.tlct}>{isDone ? '' : '○'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.tld, isDone && styles.tldDone]}>
                {t(tl.day as TranslationKey)}
              </Text>
              <Text style={styles.tla}>{t(tl.action as TranslationKey)}</Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#ecfdf5' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#059669', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  tab: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    minWidth: 90,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  tabA: { borderColor: '#059669', backgroundColor: '#ecfdf5' },
  te: { fontSize: 28 },
  tn: { fontSize: 11, fontWeight: '600', color: '#6b7280', marginTop: 4 },
  tnA: { color: '#059669' },
  progress: { marginBottom: 16 },
  progressText: { fontSize: 13, fontWeight: '600', color: '#059669', marginBottom: 6 },
  bar: { height: 8, backgroundColor: '#f3f4f6', borderRadius: 4 },
  fill: { height: 8, backgroundColor: '#059669', borderRadius: 4 },
  st: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 10, marginTop: 8 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 12 },
  ac: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 8 },
  acb: { fontSize: 14, color: '#059669' },
  act: { fontSize: 13, color: '#374151', flex: 1, textAlign: 'right' },
  tl: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 6,
  },
  tlDone: { opacity: 0.6 },
  tlc: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tlcDone: { backgroundColor: '#059669', borderColor: '#059669' },
  tlct: { fontSize: 12, color: '#6b7280' },
  tld: { fontSize: 12, fontWeight: '700', color: '#111827' },
  tldDone: { textDecorationLine: 'line-through', color: '#9ca3af' },
  tla: { fontSize: 13, color: '#374151', marginTop: 2 },
});

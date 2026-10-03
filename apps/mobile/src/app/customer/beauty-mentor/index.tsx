import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import type { JSX } from 'react';
import { useRouter } from 'expo-router';
import type { TranslationKey } from '@galaxy/shared';
import { useLocale } from '@/components/LocaleProvider';

interface MentorLevel {
  key: string;
  emoji: string;
  nameKey: TranslationKey;
  descKey: TranslationKey;
}

const MENTOR_LEVELS: MentorLevel[] = [
  {
    key: 'beginner',
    emoji: '🌱',
    nameKey: 'beautyMentor.level-beginner',
    descKey: 'beautyMentor.level-beginner-desc',
  },
  {
    key: 'intermediate',
    emoji: '🌿',
    nameKey: 'beautyMentor.level-intermediate',
    descKey: 'beautyMentor.level-intermediate-desc',
  },
  {
    key: 'advanced',
    emoji: '🌳',
    nameKey: 'beautyMentor.level-advanced',
    descKey: 'beautyMentor.level-advanced-desc',
  },
];

interface MentorTopic {
  key: string;
  labelKey: TranslationKey;
}

const TOPICS: MentorTopic[] = [
  { key: 'skin', labelKey: 'beautyMentor.topic-skin' },
  { key: 'makeup', labelKey: 'beautyMentor.topic-makeup' },
  { key: 'hair', labelKey: 'beautyMentor.topic-hair' },
  { key: 'nails', labelKey: 'beautyMentor.topic-nails' },
  { key: 'perfume', labelKey: 'beautyMentor.topic-perfume' },
  { key: 'nutrition', labelKey: 'beautyMentor.topic-nutrition' },
];

interface PlanWeek {
  labelKey: TranslationKey;
  titleKey: TranslationKey;
  descKey: TranslationKey;
}

const PLAN_WEEKS: PlanWeek[] = [
  {
    labelKey: 'mobile.beautyMentor.week1.label',
    titleKey: 'mobile.beautyMentor.week1.title',
    descKey: 'mobile.beautyMentor.week1.desc',
  },
  {
    labelKey: 'mobile.beautyMentor.week2.label',
    titleKey: 'mobile.beautyMentor.week2.title',
    descKey: 'mobile.beautyMentor.week2.desc',
  },
  {
    labelKey: 'mobile.beautyMentor.week3.label',
    // title reuses scanner.ingredients (verbatim ar match).
    titleKey: 'scanner.ingredients',
    descKey: 'mobile.beautyMentor.week3.desc',
  },
  {
    labelKey: 'mobile.beautyMentor.week4.label',
    titleKey: 'mobile.beautyMentor.week4.title',
    descKey: 'mobile.beautyMentor.week4.desc',
  },
];

export default function BeautyMentorScreen(): JSX.Element {
  const router = useRouter();
  const { t } = useLocale();
  const [level, setLevel] = useState('beginner');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  const currentLevel = MENTOR_LEVELS.find((l) => l.key === level)!;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>{t('beautyMentor.title')}</Text>
      <Text style={styles.sub}>{t('beautyMentor.subtitle')}</Text>

      <Text style={styles.st}>{t('beautyMentor.your-level')}</Text>
      <View style={styles.levels}>
        {MENTOR_LEVELS.map((l) => (
          <TouchableOpacity
            key={l.key}
            onPress={() => setLevel(l.key)}
            style={[styles.lc, level === l.key && styles.lca]}
          >
            <Text style={styles.le}>{l.emoji}</Text>
            <Text style={[styles.ln, level === l.key && styles.lna]}>{t(l.nameKey)}</Text>
            <Text style={styles.ld}>{t(l.descKey)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.st}>{t('beautyMentor.topics')}</Text>
      <View style={styles.topics}>
        {TOPICS.map((tp) => (
          <TouchableOpacity
            key={tp.key}
            onPress={() => setSelectedTopic(tp.key)}
            style={[styles.tp, selectedTopic === tp.key && styles.tpa]}
          >
            <Text style={[styles.tpt, selectedTopic === tp.key && styles.tpta]}>
              {t(tp.labelKey)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.st}>
        {t('beautyMentor.learning-plan', { name: t(currentLevel.nameKey) })}
      </Text>
      <View style={styles.plan}>
        {PLAN_WEEKS.map((w, i) => (
          <View key={i} style={styles.week}>
            <View style={styles.wn}>
              <Text style={styles.wnt}>{i + 1}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.wt}>{t(w.titleKey)}</Text>
              <Text style={styles.wd}>{t(w.descKey)}</Text>
            </View>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={styles.btn}
        onPress={() => router.push('/customer/beauty-courses' as never)}
      >
        <Text style={styles.bt}>{t('beautyMentor.start')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#eff6ff' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#2563eb', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  st: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 10, marginTop: 8 },
  levels: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  lc: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  lca: { borderColor: '#2563eb', backgroundColor: '#eff6ff' },
  le: { fontSize: 28 },
  ln: { fontSize: 13, fontWeight: '700', color: '#111827', marginTop: 4 },
  lna: { color: '#2563eb' },
  ld: { fontSize: 10, color: '#6b7280', marginTop: 2, textAlign: 'center' },
  topics: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 20 },
  tp: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  tpa: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  tpt: { fontSize: 12, fontWeight: '600', color: '#6b7280' },
  tpta: { color: '#fff' },
  plan: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 20 },
  week: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 12 },
  wn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wnt: { color: '#fff', fontSize: 13, fontWeight: '700' },
  wt: { fontSize: 14, fontWeight: '600', color: '#111827' },
  wd: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  btn: { backgroundColor: '#2563eb', borderRadius: 14, padding: 16, alignItems: 'center' },
  bt: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

import type { JSX } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import type { TranslationKey } from '@galaxy/shared';
import { useLocale } from '@/components/LocaleProvider';

interface Tip {
  emoji: string;
  textKey: TranslationKey;
}
interface Card {
  emoji: string;
  titleKey: TranslationKey;
  subtitleKey: TranslationKey;
  color: string;
  bg: string;
  tips: Tip[];
}

const CARDS: Card[] = [
  {
    emoji: '😴',
    titleKey: 'mobile.wellness.card.sleepBeauty.title',
    subtitleKey: 'mobile.wellness.card.sleepBeauty.subtitle',
    color: '#7c3aed',
    bg: '#f5f3ff',
    tips: [
      { emoji: '⏰', textKey: 'mobile.wellness.card.sleepBeauty.tip1' },
      { emoji: '📵', textKey: 'mobile.wellness.card.sleepBeauty.tip2' },
      { emoji: '🌙', textKey: 'mobile.wellness.card.sleepBeauty.tip3' },
      { emoji: '📅', textKey: 'mobile.wellness.card.sleepBeauty.tip4' },
    ],
  },
  {
    emoji: '💧',
    titleKey: 'mobile.bookingChecklist.item-drink-water',
    subtitleKey: 'mobile.wellness.card.water.subtitle',
    color: '#0284c7',
    bg: '#f0f9ff',
    tips: [
      { emoji: '🌅', textKey: 'mobile.wellness.card.water.tip1' },
      { emoji: '🍋', textKey: 'mobile.wellness.card.water.tip2' },
      { emoji: '📱', textKey: 'mobile.wellness.card.water.tip3' },
      { emoji: '🥤', textKey: 'mobile.wellness.card.water.tip4' },
    ],
  },
  {
    emoji: '🥗',
    titleKey: 'mobile.wellness.card.nutrition.title',
    subtitleKey: 'mobile.wellness.card.nutrition.subtitle',
    color: '#059669',
    bg: '#ecfdf5',
    tips: [
      { emoji: '🥑', textKey: 'mobile.wellness.card.nutrition.tip1' },
      { emoji: '🫐', textKey: 'mobile.wellness.card.nutrition.tip2' },
      { emoji: '🐟', textKey: 'mobile.wellness.card.nutrition.tip3' },
      { emoji: '🥬', textKey: 'mobile.wellness.card.nutrition.tip4' },
    ],
  },
  {
    emoji: '🏃',
    titleKey: 'mobile.wellness.card.exercise.title',
    subtitleKey: 'mobile.wellness.card.exercise.subtitle',
    color: '#ea580c',
    bg: '#fff7ed',
    tips: [
      { emoji: '🚶', textKey: 'mobile.wellness.card.exercise.tip1' },
      { emoji: '🧘', textKey: 'mobile.wellness.card.exercise.tip2' },
      { emoji: '💪', textKey: 'mobile.wellness.card.exercise.tip3' },
      { emoji: '🤸', textKey: 'mobile.wellness.card.exercise.tip4' },
    ],
  },
  {
    emoji: '🧘',
    titleKey: 'mobile.wellness.card.meditation.title',
    subtitleKey: 'mobile.wellness.card.meditation.subtitle',
    color: '#0d9488',
    bg: '#f0fdfa',
    tips: [
      { emoji: '🫁', textKey: 'mobile.wellness.card.meditation.tip1' },
      { emoji: '🌅', textKey: 'mobile.wellness.card.meditation.tip2' },
      { emoji: '🤫', textKey: 'mobile.wellness.card.meditation.tip3' },
      { emoji: '🎵', textKey: 'mobile.wellness.card.meditation.tip4' },
    ],
  },
  {
    emoji: '😊',
    titleKey: 'mobile.wellness.card.smile.title',
    subtitleKey: 'mobile.wellness.card.smile.subtitle',
    color: '#db2777',
    bg: '#fdf2f8',
    tips: [
      { emoji: '🪞', textKey: 'mobile.wellness.card.smile.tip1' },
      { emoji: '📝', textKey: 'mobile.wellness.card.smile.tip2' },
      { emoji: '👭', textKey: 'mobile.wellness.card.smile.tip3' },
      { emoji: '🎯', textKey: 'mobile.wellness.card.smile.tip4' },
    ],
  },
  {
    emoji: '☀️',
    titleKey: 'beautyTips.tip.title',
    subtitleKey: 'mobile.wellness.card.sunscreen.subtitle',
    color: '#d97706',
    bg: '#fffbeb',
    tips: [
      { emoji: '🧴', textKey: 'mobile.beautyServices.sunAdvice.tip1' },
      { emoji: '⏰', textKey: 'mobile.wellness.card.sunscreen.tip2' },
      { emoji: '🏠', textKey: 'mobile.beautyServices.sunAdvice.tip3' },
      { emoji: '📅', textKey: 'mobile.beautyServices.sunAdvice.tip4' },
    ],
  },
  {
    emoji: '🧍',
    titleKey: 'mobile.wellness.card.posture.title',
    subtitleKey: 'mobile.wellness.card.posture.subtitle',
    color: '#4f46e5',
    bg: '#eef2ff',
    tips: [
      { emoji: '💪', textKey: 'mobile.wellness.card.posture.tip1' },
      { emoji: '🪑', textKey: 'mobile.wellness.card.posture.tip2' },
      { emoji: '📱', textKey: 'mobile.wellness.card.posture.tip3' },
      { emoji: '💆', textKey: 'mobile.wellness.card.posture.tip4' },
    ],
  },
  {
    emoji: '🌙',
    titleKey: 'mobile.wellness.card.ramadan.title',
    subtitleKey: 'mobile.wellness.card.ramadan.subtitle',
    color: '#d97706',
    bg: '#fffbeb',
    tips: [
      { emoji: '💧', textKey: 'mobile.wellness.card.ramadan.tip1' },
      { emoji: '🧴', textKey: 'mobile.wellness.card.ramadan.tip2' },
      { emoji: '☀️', textKey: 'mobile.wellness.card.ramadan.tip3' },
      { emoji: '💧', textKey: 'mobile.wellness.card.ramadan.tip4' },
    ],
  },
  {
    emoji: '🏃',
    titleKey: 'mobile.wellness.card.postWorkout.title',
    subtitleKey: 'mobile.wellness.card.postWorkout.subtitle',
    color: '#059669',
    bg: '#ecfdf5',
    tips: [
      { emoji: '🧼', textKey: 'mobile.wellness.card.postWorkout.tip1' },
      { emoji: '🧊', textKey: 'mobile.wellness.card.postWorkout.tip2' },
      { emoji: '🧴', textKey: 'mobile.wellness.card.postWorkout.tip3' },
      { emoji: '👕', textKey: 'mobile.wellness.card.postWorkout.tip4' },
    ],
  },
  {
    emoji: '🧳',
    titleKey: 'mobile.wellness.card.travelBag.title',
    subtitleKey: 'mobile.wellness.card.travelBag.subtitle',
    color: '#4f46e5',
    bg: '#eef2ff',
    tips: [
      { emoji: '🧴', textKey: 'mobile.wellness.card.travelBag.tip1' },
      { emoji: '☀️', textKey: 'mobile.wellness.card.travelBag.tip2' },
      { emoji: '💄', textKey: 'mobile.wellness.card.travelBag.tip3' },
      { emoji: '🧻', textKey: 'mobile.wellness.card.travelBag.tip4' },
    ],
  },
  {
    emoji: '🧴',
    titleKey: 'mobile.wellness.card.capsule.title',
    subtitleKey: 'mobile.wellness.card.capsule.subtitle',
    color: '#e11d48',
    bg: '#fff1f2',
    tips: [
      { emoji: '🧴', textKey: 'mobile.wellness.card.capsule.tip1' },
      { emoji: '💄', textKey: 'mobile.wellness.card.capsule.tip2' },
      { emoji: '🔄', textKey: 'mobile.wellness.card.capsule.tip3' },
      { emoji: '📅', textKey: 'mobile.wellness.card.capsule.tip4' },
    ],
  },
  {
    emoji: '🛏',
    titleKey: 'mobile.wellness.card.sleepRituals.title',
    subtitleKey: 'mobile.wellness.card.sleepRituals.subtitle',
    color: '#7c3aed',
    bg: '#f5f3ff',
    tips: [
      { emoji: '🧼', textKey: 'mobile.wellness.card.sleepRituals.tip1' },
      { emoji: '💧', textKey: 'mobile.wellness.card.sleepRituals.tip2' },
      { emoji: '💆', textKey: 'mobile.wellness.card.sleepRituals.tip3' },
      { emoji: '📵', textKey: 'mobile.wellness.card.sleepRituals.tip4' },
    ],
  },
  {
    emoji: '🧬',
    titleKey: 'mobile.wellness.card.collagen.title',
    subtitleKey: 'mobile.wellness.card.collagen.subtitle',
    color: '#e11d48',
    bg: '#fff1f2',
    tips: [
      { emoji: '🥤', textKey: 'mobile.wellness.card.collagen.tip1' },
      { emoji: '🍊', textKey: 'mobile.wellness.card.collagen.tip2' },
      { emoji: '⏳', textKey: 'mobile.wellness.card.collagen.tip3' },
      { emoji: '💅', textKey: 'mobile.wellness.card.collagen.tip4' },
    ],
  },
  {
    emoji: '💊',
    titleKey: 'mobile.wellness.card.biotin.title',
    subtitleKey: 'mobile.wellness.card.biotin.subtitle',
    color: '#059669',
    bg: '#ecfdf5',
    tips: [
      { emoji: '💇', textKey: 'mobile.wellness.card.biotin.tip1' },
      { emoji: '💅', textKey: 'mobile.wellness.card.biotin.tip2' },
      { emoji: '🥚', textKey: 'mobile.wellness.card.biotin.tip3' },
      { emoji: '⏳', textKey: 'mobile.wellness.card.biotin.tip4' },
    ],
  },
  {
    emoji: '💉',
    titleKey: 'mobile.wellness.card.glutathione.title',
    subtitleKey: 'mobile.wellness.card.glutathione.subtitle',
    color: '#d97706',
    bg: '#fffbeb',
    tips: [
      { emoji: '✨', textKey: 'mobile.wellness.card.glutathione.tip1' },
      { emoji: '🛡️', textKey: 'mobile.wellness.card.glutathione.tip2' },
      { emoji: '💉', textKey: 'mobile.wellness.card.glutathione.tip3' },
      { emoji: '🍅', textKey: 'mobile.wellness.card.glutathione.tip4' },
    ],
  },
  {
    emoji: '🐟',
    titleKey: 'mobile.wellness.card.omega3.title',
    subtitleKey: 'mobile.wellness.card.omega3.subtitle',
    color: '#0284c7',
    bg: '#f0f9ff',
    tips: [
      { emoji: '💧', textKey: 'mobile.wellness.card.omega3.tip1' },
      { emoji: '🌿', textKey: 'mobile.wellness.card.omega3.tip2' },
      { emoji: '🐟', textKey: 'mobile.wellness.card.omega3.tip3' },
      { emoji: '🥜', textKey: 'mobile.wellness.card.omega3.tip4' },
    ],
  },
  {
    emoji: '🦠',
    titleKey: 'mobile.wellness.card.probiotics.title',
    subtitleKey: 'mobile.wellness.card.probiotics.subtitle',
    color: '#0d9488',
    bg: '#f0fdfa',
    tips: [
      { emoji: '🦠', textKey: 'mobile.wellness.card.probiotics.tip1' },
      { emoji: '🌿', textKey: 'mobile.wellness.card.probiotics.tip2' },
      { emoji: '🥛', textKey: 'mobile.wellness.card.probiotics.tip3' },
      { emoji: '💊', textKey: 'mobile.wellness.card.probiotics.tip4' },
    ],
  },
  {
    emoji: '🍵',
    titleKey: 'mobile.wellness.card.greenTea.title',
    subtitleKey: 'mobile.wellness.card.greenTea.subtitle',
    color: '#059669',
    bg: '#ecfdf5',
    tips: [
      { emoji: '🛡️', textKey: 'mobile.wellness.card.greenTea.tip1' },
      { emoji: '🌿', textKey: 'mobile.wellness.card.greenTea.tip2' },
      { emoji: '🍵', textKey: 'mobile.wellness.card.greenTea.tip3' },
      { emoji: '🫖', textKey: 'mobile.wellness.card.greenTea.tip4' },
    ],
  },
  {
    emoji: '🍃',
    titleKey: 'mobile.wellness.card.matcha.title',
    subtitleKey: 'mobile.wellness.card.matcha.subtitle',
    color: '#16a34a',
    bg: '#f0fdf4',
    tips: [
      { emoji: '💚', textKey: 'mobile.wellness.card.matcha.tip1' },
      { emoji: '🌱', textKey: 'mobile.wellness.card.matcha.tip2' },
      { emoji: '😌', textKey: 'mobile.wellness.card.matcha.tip3' },
      { emoji: '🥛', textKey: 'mobile.wellness.card.matcha.tip4' },
    ],
  },
  {
    emoji: '🥛',
    titleKey: 'mobile.wellness.card.turmericLatte.title',
    subtitleKey: 'mobile.wellness.card.turmericLatte.subtitle',
    color: '#d97706',
    bg: '#fffbeb',
    tips: [
      { emoji: '🟡', textKey: 'mobile.wellness.card.turmericLatte.tip1' },
      { emoji: '🌿', textKey: 'mobile.wellness.card.turmericLatte.tip2' },
      { emoji: '🥛', textKey: 'mobile.wellness.card.turmericLatte.tip3' },
      { emoji: '😌', textKey: 'mobile.wellness.card.turmericLatte.tip4' },
    ],
  },
  {
    emoji: '🌱',
    titleKey: 'mobile.wellness.card.chlorophyll.title',
    subtitleKey: 'mobile.wellness.card.chlorophyll.subtitle',
    color: '#0d9488',
    bg: '#f0fdfa',
    tips: [
      { emoji: '🌿', textKey: 'mobile.wellness.card.chlorophyll.tip1' },
      { emoji: '🩸', textKey: 'mobile.wellness.card.chlorophyll.tip2' },
      { emoji: '💧', textKey: 'mobile.wellness.card.chlorophyll.tip3' },
      { emoji: '🌱', textKey: 'mobile.wellness.card.chlorophyll.tip4' },
    ],
  },
  {
    emoji: '🫒',
    titleKey: 'mobile.wellness.card.beetroot.title',
    subtitleKey: 'mobile.wellness.card.beetroot.subtitle',
    color: '#e11d48',
    bg: '#fff1f2',
    tips: [
      { emoji: '💓', textKey: 'mobile.wellness.card.beetroot.tip1' },
      { emoji: '🩸', textKey: 'mobile.wellness.card.beetroot.tip2' },
      { emoji: '🍊', textKey: 'mobile.wellness.card.beetroot.tip3' },
      { emoji: '🥤', textKey: 'mobile.wellness.card.beetroot.tip4' },
    ],
  },
  {
    emoji: '💆',
    titleKey: 'mobile.wellness.card.faceYoga.title',
    subtitleKey: 'mobile.wellness.card.faceYoga.subtitle',
    color: '#7c3aed',
    bg: '#f5f3ff',
    tips: [
      { emoji: '😮', textKey: 'mobile.wellness.card.faceYoga.tip1' },
      { emoji: '💋', textKey: 'mobile.wellness.card.faceYoga.tip2' },
      { emoji: '😊', textKey: 'mobile.wellness.card.faceYoga.tip3' },
      { emoji: '⏱️', textKey: 'mobile.wellness.card.faceYoga.tip4' },
    ],
  },
  {
    emoji: '🩰',
    titleKey: 'mobile.wellness.card.barre.title',
    subtitleKey: 'mobile.wellness.card.barre.subtitle',
    color: '#ec4899',
    bg: '#fdf2f8',
    tips: [
      { emoji: '🦵', textKey: 'mobile.wellness.card.barre.tip1' },
      { emoji: '🧍', textKey: 'mobile.wellness.card.barre.tip2' },
      { emoji: '💪', textKey: 'mobile.wellness.card.barre.tip3' },
      { emoji: '👭', textKey: 'mobile.wellness.card.barre.tip4' },
    ],
  },
  {
    emoji: '💄',
    titleKey: 'mobile.wellness.card.sweatProofMakeup.title',
    subtitleKey: 'mobile.wellness.card.sweatProofMakeup.subtitle',
    color: '#0d9488',
    bg: '#f0fdfa',
    tips: [
      { emoji: '🧴', textKey: 'mobile.wellness.card.sweatProofMakeup.tip1' },
      { emoji: '💄', textKey: 'mobile.wellness.card.sweatProofMakeup.tip2' },
      { emoji: '💦', textKey: 'mobile.wellness.card.sweatProofMakeup.tip3' },
      { emoji: '🧻', textKey: 'mobile.wellness.card.sweatProofMakeup.tip4' },
    ],
  },
  {
    emoji: '💇',
    titleKey: 'mobile.wellness.card.postWorkoutHair.title',
    subtitleKey: 'mobile.wellness.card.postWorkoutHair.subtitle',
    color: '#d97706',
    bg: '#fffbeb',
    tips: [
      { emoji: '🧴', textKey: 'mobile.wellness.card.postWorkoutHair.tip1' },
      { emoji: '💇', textKey: 'mobile.wellness.card.postWorkoutHair.tip2' },
      { emoji: '💧', textKey: 'mobile.wellness.card.postWorkoutHair.tip3' },
      { emoji: '📅', textKey: 'mobile.wellness.card.postWorkoutHair.tip4' },
    ],
  },
  {
    emoji: '✨',
    titleKey: 'mobile.wellness.card.workoutGlow.title',
    subtitleKey: 'mobile.wellness.card.workoutGlow.subtitle',
    color: '#e11d48',
    bg: '#fff1f2',
    tips: [
      { emoji: '🩸', textKey: 'mobile.wellness.card.workoutGlow.tip1' },
      { emoji: '💦', textKey: 'mobile.wellness.card.workoutGlow.tip2' },
      { emoji: '🧼', textKey: 'mobile.wellness.card.workoutGlow.tip3' },
      { emoji: '💧', textKey: 'mobile.wellness.card.workoutGlow.tip4' },
    ],
  },
  {
    emoji: '🛌',
    titleKey: 'mobile.wellness.card.sleepPosition.title',
    subtitleKey: 'mobile.wellness.card.sleepPosition.subtitle',
    color: '#4f46e5',
    bg: '#eef2ff',
    tips: [
      { emoji: '🛏️', textKey: 'mobile.wellness.card.sleepPosition.tip1' },
      { emoji: '🫂', textKey: 'mobile.wellness.card.sleepPosition.tip2' },
      { emoji: '❌', textKey: 'mobile.wellness.card.sleepPosition.tip3' },
      { emoji: '🪶', textKey: 'mobile.wellness.card.sleepPosition.tip4' },
    ],
  },
  {
    emoji: '🧖',
    titleKey: 'mobile.wellness.card.nightRoutine.title',
    subtitleKey: 'mobile.wellness.card.nightRoutine.subtitle',
    color: '#7c3aed',
    bg: '#f5f3ff',
    tips: [
      { emoji: '🧼', textKey: 'mobile.wellness.card.nightRoutine.tip1' },
      { emoji: '🧴', textKey: 'mobile.wellness.card.nightRoutine.tip2' },
      { emoji: '📵', textKey: 'mobile.wellness.card.nightRoutine.tip3' },
      { emoji: '🕯️', textKey: 'mobile.wellness.card.nightRoutine.tip4' },
    ],
  },
];

export default function WellnessScreen(): JSX.Element {
  const { t } = useLocale();
  return (
    <ScrollView style={s.c} contentContainerStyle={s.i}>
      <Text style={s.h}>{t('mobile.wellness.title')}</Text>
      <Text style={s.sub}>{t('mobile.wellness.subtitle')}</Text>
      <View style={s.grid}>
        {CARDS.map((c, i) => (
          <View key={i} style={[s.card, { borderColor: c.color + '30' }]}>
            <View style={s.ch}>
              <Text style={s.ce}>{c.emoji}</Text>
              <View style={s.cw}>
                <Text style={[s.ct, { color: c.color }]}>{t(c.titleKey)}</Text>
                <Text style={s.cs}>{t(c.subtitleKey)}</Text>
              </View>
            </View>
            <View style={s.tl}>
              {c.tips.map((tip, j) => (
                <View key={j} style={[s.tr, { backgroundColor: c.bg }]}>
                  <Text style={s.te}>{tip.emoji}</Text>
                  <Text style={[s.tt, { color: c.color }]}>{t(tip.textKey)}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#f5f3ff' },
  i: { padding: 16, paddingTop: 40, paddingBottom: 60 },
  h: { fontSize: 24, fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: 6 },
  sub: { fontSize: 13, color: '#6b7280', textAlign: 'center', marginBottom: 24, lineHeight: 22 },
  grid: { gap: 12 },
  card: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 4 },
  ch: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  ce: { fontSize: 28 },
  cw: { flex: 1 },
  ct: { fontSize: 15, fontWeight: '700' },
  cs: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
  tl: { gap: 6 },
  tr: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  te: { fontSize: 14, width: 20, textAlign: 'center' },
  tt: { fontSize: 12, fontWeight: '500', flex: 1, textAlign: 'right' },
});

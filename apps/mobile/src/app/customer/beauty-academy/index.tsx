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
    emoji: '📖',
    titleKey: 'mobile.beautyAcademy.card.encyclopedia.title',
    subtitleKey: 'mobile.beautyAcademy.card.encyclopedia.subtitle',
    color: '#d97706',
    bg: '#fffbeb',
    tips: [
      { emoji: '✨', textKey: 'mobile.beautyAcademy.card.encyclopedia.tip1' },
      { emoji: '🌅', textKey: 'mobile.beautyAcademy.card.encyclopedia.tip2' },
      { emoji: '⏰', textKey: 'mobile.beautyAcademy.card.encyclopedia.tip3' },
      { emoji: '✅', textKey: 'mobile.beautyAcademy.card.encyclopedia.tip4' },
    ],
  },
  {
    emoji: '🔍',
    titleKey: 'mobile.beautyAcademy.card.skinTest.title',
    subtitleKey: 'mobile.beautyAcademy.card.skinTest.subtitle',
    color: '#0d9488',
    bg: '#f0fdfa',
    tips: [
      { emoji: '💧', textKey: 'mobile.beautyAcademy.card.skinTest.tip1' },
      { emoji: '🥵', textKey: 'mobile.beautyAcademy.card.skinTest.tip2' },
      { emoji: '🌸', textKey: 'mobile.beautyAcademy.card.skinTest.tip3' },
      { emoji: '🎯', textKey: 'mobile.beautyAcademy.card.skinTest.tip4' },
    ],
  },
  {
    emoji: '❓',
    titleKey: 'mobile.beautyAcademy.card.trivia.title',
    subtitleKey: 'mobile.beautyAcademy.card.trivia.subtitle',
    color: '#7c3aed',
    bg: '#f5f3ff',
    tips: [
      { emoji: '💊', textKey: 'mobile.beautyAcademy.card.trivia.tip1' },
      { emoji: '🧪', textKey: 'mobile.beautyAcademy.card.trivia.tip2' },
      { emoji: '💧', textKey: 'mobile.beautyAcademy.card.trivia.tip3' },
      { emoji: '🎮', textKey: 'mobile.beautyAcademy.card.trivia.tip4' },
    ],
  },
  {
    emoji: '🤔',
    titleKey: 'mobile.beautyAcademy.card.myths.title',
    subtitleKey: 'mobile.beautyAcademy.card.myths.subtitle',
    color: '#e11d48',
    bg: '#fff1f2',
    tips: [
      { emoji: '🦷', textKey: 'mobile.beautyAcademy.card.myths.tip1' },
      { emoji: '💇', textKey: 'mobile.beautyAcademy.card.myths.tip2' },
      { emoji: '🔬', textKey: 'mobile.beautyAcademy.card.myths.tip3' },
      { emoji: '🩺', textKey: 'mobile.beautyAcademy.card.myths.tip4' },
    ],
  },
  {
    emoji: '💼',
    titleKey: 'mobile.beautyAcademy.card.career.title',
    subtitleKey: 'mobile.beautyAcademy.card.career.subtitle',
    color: '#db2777',
    bg: '#fdf2f8',
    tips: [
      { emoji: '🌱', textKey: 'mobile.beautyAcademy.card.career.tip1' },
      { emoji: '🎓', textKey: 'mobile.beautyAcademy.card.career.tip2' },
      { emoji: '📅', textKey: 'mobile.beautyAcademy.card.career.tip3' },
      { emoji: '📸', textKey: 'mobile.beautyAcademy.card.career.tip4' },
    ],
  },
  {
    emoji: '🥑',
    titleKey: 'mobile.beautyAcademy.card.recipes.title',
    subtitleKey: 'mobile.beautyAcademy.card.recipes.subtitle',
    color: '#059669',
    bg: '#ecfdf5',
    tips: [
      { emoji: '🥑', textKey: 'mobile.beautyAcademy.card.recipes.tip1' },
      { emoji: '⏳', textKey: 'mobile.beautyAcademy.card.recipes.tip2' },
      { emoji: '✨', textKey: 'mobile.beautyAcademy.card.recipes.tip3' },
      { emoji: '📆', textKey: 'mobile.beautyAcademy.card.recipes.tip4' },
    ],
  },
  {
    emoji: '🧴',
    titleKey: 'mobile.beautyAcademy.card.infographic.title',
    subtitleKey: 'mobile.beautyAcademy.card.infographic.subtitle',
    color: '#0284c7',
    bg: '#f0f9ff',
    tips: [
      { emoji: '☀️', textKey: 'mobile.beautyAcademy.card.infographic.tip1' },
      { emoji: '🌞', textKey: 'mobile.beautyAcademy.card.infographic.tip2' },
      { emoji: '📚', textKey: 'mobile.beautyAcademy.card.infographic.tip3' },
      { emoji: '🧴', textKey: 'mobile.beautyAcademy.card.infographic.tip4' },
    ],
  },
  {
    emoji: '💡',
    titleKey: 'mobile.beautyAcademy.card.quickTip.title',
    subtitleKey: 'mobile.beautyAcademy.card.quickTip.subtitle',
    color: '#d97706',
    bg: '#fffbeb',
    tips: [
      { emoji: '📋', textKey: 'mobile.beautyAcademy.card.quickTip.tip1' },
      { emoji: '⏰', textKey: 'mobile.beautyAcademy.card.quickTip.tip2' },
      { emoji: '💧', textKey: 'mobile.beautyAcademy.card.quickTip.tip3' },
      { emoji: '🌅', textKey: 'mobile.beautyAcademy.card.quickTip.tip4' },
    ],
  },
  {
    emoji: '🌿',
    titleKey: 'mobile.beautyAcademy.card.saudiHeritage.title',
    subtitleKey: 'mobile.beautyAcademy.card.saudiHeritage.subtitle',
    color: '#d97706',
    bg: '#fffbeb',
    tips: [
      { emoji: '🌿', textKey: 'mobile.beautyAcademy.card.saudiHeritage.tip1' },
      { emoji: '🎨', textKey: 'mobile.beautyAcademy.card.saudiHeritage.tip2' },
      { emoji: '💍', textKey: 'mobile.beautyAcademy.card.saudiHeritage.tip3' },
      { emoji: '💪', textKey: 'mobile.beautyAcademy.card.saudiHeritage.tip4' },
    ],
  },
  {
    emoji: '🎓',
    titleKey: 'mobile.beautyAcademy.card.careCertificate.title',
    subtitleKey: 'mobile.beautyAcademy.card.careCertificate.subtitle',
    color: '#0d9488',
    bg: '#f0fdfa',
    tips: [
      { emoji: '📝', textKey: 'mobile.beautyAcademy.card.careCertificate.tip1' },
      { emoji: '📊', textKey: 'mobile.beautyAcademy.card.careCertificate.tip2' },
      { emoji: '🔜', textKey: 'mobile.beautyAcademy.card.careCertificate.tip3' },
      { emoji: '🏆', textKey: 'mobile.beautyAcademy.card.careCertificate.tip4' },
    ],
  },
];

export default function BeautyAcademyScreen(): JSX.Element {
  const { t } = useLocale();
  return (
    <ScrollView style={s.c} contentContainerStyle={s.i}>
      <Text style={s.h}>{t('beautyAcademy.title')}</Text>
      <Text style={s.sub}>{t('beautyAcademy.subtitle')}</Text>
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
  c: { flex: 1, backgroundColor: '#fffbeb' },
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

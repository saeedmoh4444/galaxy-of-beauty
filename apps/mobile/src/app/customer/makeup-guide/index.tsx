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
    emoji: '💄',
    titleKey: 'mobile.makeupGuide.card.base.title',
    subtitleKey: 'mobile.makeupGuide.card.base.subtitle',
    color: '#d97706',
    bg: '#fffbeb',
    tips: [
      { emoji: '🧴', textKey: 'mobile.makeupGuide.card.base.tip1' },
      { emoji: '💧', textKey: 'mobile.makeupGuide.card.base.tip2' },
      { emoji: '🧽', textKey: 'mobile.makeupGuide.card.base.tip3' },
      { emoji: '🧽', textKey: 'mobile.makeupGuide.card.base.tip4' },
    ],
  },
  {
    emoji: '🖌',
    titleKey: 'mobile.makeupGuide.card.brushes.title',
    subtitleKey: 'mobile.makeupGuide.card.brushes.subtitle',
    color: '#e11d48',
    bg: '#fff1f2',
    tips: [
      { emoji: '🧼', textKey: 'mobile.makeupGuide.card.brushes.tip1' },
      { emoji: '💨', textKey: 'mobile.makeupGuide.card.brushes.tip2' },
      { emoji: '🔄', textKey: 'mobile.makeupGuide.card.brushes.tip3' },
      { emoji: '🚫', textKey: 'mobile.makeupGuide.card.brushes.tip4' },
    ],
  },
  {
    emoji: '👀',
    titleKey: 'mobile.makeupGuide.card.eyes.title',
    subtitleKey: 'mobile.makeupGuide.card.eyes.subtitle',
    color: '#7c3aed',
    bg: '#f5f3ff',
    tips: [
      { emoji: '🤍', textKey: 'mobile.makeupGuide.card.eyes.tip1' },
      { emoji: '🤎', textKey: 'mobile.makeupGuide.card.eyes.tip2' },
      { emoji: '✨', textKey: 'mobile.makeupGuide.card.eyes.tip3' },
      { emoji: '🌀', textKey: 'mobile.makeupGuide.card.eyes.tip4' },
    ],
  },
  {
    emoji: '💋',
    titleKey: 'mobile.makeupGuide.card.lips.title',
    subtitleKey: 'mobile.makeupGuide.card.lips.subtitle',
    color: '#db2777',
    bg: '#fdf2f8',
    tips: [
      { emoji: '🍯', textKey: 'mobile.makeupGuide.card.lips.tip1' },
      { emoji: '💧', textKey: 'mobile.makeupGuide.card.lips.tip2' },
      { emoji: '👄', textKey: 'mobile.makeupGuide.card.lips.tip3' },
      { emoji: '💄', textKey: 'mobile.makeupGuide.card.lips.tip4' },
    ],
  },
  {
    emoji: '🎨',
    titleKey: 'mobile.makeupGuide.card.contour.title',
    subtitleKey: 'mobile.makeupGuide.card.contour.subtitle',
    color: '#d97706',
    bg: '#fffbeb',
    tips: [
      { emoji: '🟤', textKey: 'mobile.makeupGuide.card.contour.tip1' },
      { emoji: '⚪', textKey: 'mobile.makeupGuide.card.contour.tip2' },
      { emoji: '🌀', textKey: 'mobile.makeupGuide.card.contour.tip3' },
      { emoji: '💡', textKey: 'mobile.makeupGuide.card.contour.tip4' },
    ],
  },
  {
    emoji: '🌸',
    titleKey: 'mobile.makeupGuide.card.blush.title',
    subtitleKey: 'mobile.makeupGuide.card.blush.subtitle',
    color: '#db2777',
    bg: '#fdf2f8',
    tips: [
      { emoji: '🍎', textKey: 'mobile.makeupGuide.card.blush.tip1' },
      { emoji: '↗️', textKey: 'mobile.makeupGuide.card.blush.tip2' },
      { emoji: '🧴', textKey: 'mobile.makeupGuide.card.blush.tip3' },
      { emoji: '🪶', textKey: 'mobile.makeupGuide.card.blush.tip4' },
    ],
  },
  {
    emoji: '👰',
    titleKey: 'mobile.makeupGuide.card.bridal.title',
    subtitleKey: 'mobile.makeupGuide.card.bridal.subtitle',
    color: '#7c3aed',
    bg: '#f5f3ff',
    tips: [
      { emoji: '📅', textKey: 'mobile.makeupGuide.card.bridal.tip1' },
      { emoji: '💧', textKey: 'mobile.makeupGuide.card.bridal.tip2' },
      { emoji: '⏰', textKey: 'mobile.makeupGuide.card.bridal.tip3' },
      { emoji: '📸', textKey: 'mobile.makeupGuide.card.bridal.tip4' },
    ],
  },
  {
    emoji: '🍃',
    titleKey: 'marketing.shop-the-look.service-natural-makeup',
    subtitleKey: 'mobile.makeupGuide.card.naturalLook.subtitle',
    color: '#059669',
    bg: '#ecfdf5',
    tips: [
      { emoji: '🧴', textKey: 'mobile.makeupGuide.card.naturalLook.tip1' },
      { emoji: '✨', textKey: 'mobile.makeupGuide.card.naturalLook.tip2' },
      { emoji: '👀', textKey: 'mobile.makeupGuide.card.naturalLook.tip3' },
      { emoji: '💋', textKey: 'mobile.makeupGuide.card.naturalLook.tip4' },
    ],
  },
  {
    emoji: '🌟',
    titleKey: 'mobile.makeupGuide.card.glam.title',
    subtitleKey: 'mobile.makeupGuide.card.glam.subtitle',
    color: '#d97706',
    bg: '#fffbeb',
    tips: [
      { emoji: '✨', textKey: 'mobile.makeupGuide.card.glam.tip1' },
      { emoji: '💫', textKey: 'mobile.makeupGuide.card.glam.tip2' },
      { emoji: '⭐', textKey: 'mobile.makeupGuide.card.glam.tip3' },
      { emoji: '💡', textKey: 'mobile.makeupGuide.card.glam.tip4' },
    ],
  },
  {
    emoji: '🧼',
    titleKey: 'mobile.makeupGuide.card.removal.title',
    subtitleKey: 'mobile.makeupGuide.card.removal.subtitle',
    color: '#0891b2',
    bg: '#ecfeff',
    tips: [
      { emoji: '💧', textKey: 'mobile.makeupGuide.card.removal.tip1' },
      { emoji: '🫒', textKey: 'mobile.makeupGuide.card.removal.tip2' },
      { emoji: '🚿', textKey: 'mobile.makeupGuide.card.removal.tip3' },
      { emoji: '🚫', textKey: 'mobile.makeupGuide.card.removal.tip4' },
    ],
  },
  {
    emoji: '🪞',
    titleKey: 'mobile.makeupGuide.card.faceShapes.title',
    subtitleKey: 'mobile.makeupGuide.card.faceShapes.subtitle',
    color: '#e11d48',
    bg: '#fff1f2',
    tips: [
      { emoji: '🥚', textKey: 'mobile.makeupGuide.card.faceShapes.tip1' },
      { emoji: '💗', textKey: 'mobile.makeupGuide.card.faceShapes.tip2' },
      { emoji: '🌕', textKey: 'mobile.makeupGuide.card.faceShapes.tip3' },
      { emoji: '⬜', textKey: 'mobile.makeupGuide.card.faceShapes.tip4' },
    ],
  },
  {
    emoji: '🎨',
    titleKey: 'mobile.makeupGuide.card.contourGuide.title',
    subtitleKey: 'mobile.makeupGuide.card.contourGuide.subtitle',
    color: '#d97706',
    bg: '#fffbeb',
    tips: [
      { emoji: '🥚', textKey: 'mobile.makeupGuide.card.contourGuide.tip1' },
      { emoji: '🌕', textKey: 'mobile.makeupGuide.card.contourGuide.tip2' },
      { emoji: '⬜', textKey: 'mobile.makeupGuide.card.contourGuide.tip3' },
      { emoji: '💗', textKey: 'mobile.makeupGuide.card.contourGuide.tip4' },
    ],
  },
  {
    emoji: '🌺',
    titleKey: 'mobile.makeupGuide.card.blushPlacement.title',
    subtitleKey: 'mobile.makeupGuide.card.blushPlacement.subtitle',
    color: '#ec4899',
    bg: '#fdf2f8',
    tips: [
      { emoji: '🍎', textKey: 'mobile.makeupGuide.card.blushPlacement.tip1' },
      { emoji: '🌕', textKey: 'mobile.makeupGuide.card.blushPlacement.tip2' },
      { emoji: '⬜', textKey: 'mobile.makeupGuide.card.blushPlacement.tip3' },
      { emoji: '💗', textKey: 'mobile.makeupGuide.card.blushPlacement.tip4' },
    ],
  },
  {
    emoji: '👀',
    titleKey: 'mobile.makeupGuide.card.brows.title',
    subtitleKey: 'mobile.makeupGuide.card.brows.subtitle',
    color: '#d97706',
    bg: '#fffbeb',
    tips: [
      { emoji: '🥚', textKey: 'mobile.makeupGuide.card.brows.tip1' },
      { emoji: '🌕', textKey: 'mobile.makeupGuide.card.brows.tip2' },
      { emoji: '⬜', textKey: 'mobile.makeupGuide.card.brows.tip3' },
      { emoji: '💗', textKey: 'mobile.makeupGuide.card.brows.tip4' },
    ],
  },
  {
    emoji: '🫦',
    titleKey: 'mobile.makeupGuide.card.lipLiner.title',
    subtitleKey: 'mobile.makeupGuide.card.lipLiner.subtitle',
    color: '#e11d48',
    bg: '#fff1f2',
    tips: [
      { emoji: '👄', textKey: 'mobile.makeupGuide.card.lipLiner.tip1' },
      { emoji: '✨', textKey: 'mobile.makeupGuide.card.lipLiner.tip2' },
      { emoji: '🎨', textKey: 'mobile.makeupGuide.card.lipLiner.tip3' },
      { emoji: '💫', textKey: 'mobile.makeupGuide.card.lipLiner.tip4' },
    ],
  },
  {
    emoji: '🎉',
    titleKey: 'mobile.makeupGuide.card.partyPrep.title',
    subtitleKey: 'mobile.makeupGuide.card.partyPrep.subtitle',
    color: '#7c3aed',
    bg: '#f5f3ff',
    tips: [
      { emoji: '📅', textKey: 'mobile.makeupGuide.card.partyPrep.tip1' },
      { emoji: '😴', textKey: 'mobile.makeupGuide.card.partyPrep.tip2' },
      { emoji: '⏰', textKey: 'mobile.makeupGuide.card.partyPrep.tip3' },
      { emoji: '👜', textKey: 'mobile.makeupGuide.card.partyPrep.tip4' },
    ],
  },
  {
    emoji: '💼',
    titleKey: 'mobile.makeupGuide.card.interview.title',
    subtitleKey: 'mobile.makeupGuide.card.interview.subtitle',
    color: '#0284c7',
    bg: '#f0f9ff',
    tips: [
      { emoji: '💄', textKey: 'mobile.makeupGuide.card.interview.tip1' },
      { emoji: '💅', textKey: 'mobile.makeupGuide.card.interview.tip2' },
      { emoji: '💇', textKey: 'mobile.makeupGuide.card.interview.tip3' },
      { emoji: '🌷', textKey: 'mobile.makeupGuide.card.interview.tip4' },
    ],
  },
  {
    emoji: '🎓',
    titleKey: 'mobile.makeupGuide.card.graduation.title',
    subtitleKey: 'mobile.makeupGuide.card.graduation.subtitle',
    color: '#d97706',
    bg: '#fffbeb',
    tips: [
      { emoji: '📸', textKey: 'mobile.makeupGuide.card.graduation.tip1' },
      { emoji: '💄', textKey: 'mobile.makeupGuide.card.graduation.tip2' },
      { emoji: '💇', textKey: 'mobile.makeupGuide.card.graduation.tip3' },
      { emoji: '🌞', textKey: 'mobile.makeupGuide.card.graduation.tip4' },
    ],
  },
  {
    emoji: '💘',
    titleKey: 'mobile.makeupGuide.card.dateNight.title',
    subtitleKey: 'mobile.makeupGuide.card.dateNight.subtitle',
    color: '#e11d48',
    bg: '#fff1f2',
    tips: [
      { emoji: '✨', textKey: 'mobile.makeupGuide.card.dateNight.tip1' },
      { emoji: '👀', textKey: 'mobile.makeupGuide.card.dateNight.tip2' },
      { emoji: '💋', textKey: 'mobile.makeupGuide.card.dateNight.tip3' },
      { emoji: '🌷', textKey: 'mobile.makeupGuide.card.dateNight.tip4' },
    ],
  },
  {
    emoji: '📸',
    titleKey: 'mobile.makeupGuide.card.photoReady.title',
    subtitleKey: 'mobile.makeupGuide.card.photoReady.subtitle',
    color: '#4f46e5',
    bg: '#eef2ff',
    tips: [
      { emoji: '🚫', textKey: 'mobile.makeupGuide.card.photoReady.tip1' },
      { emoji: '🪶', textKey: 'mobile.makeupGuide.card.photoReady.tip2' },
      { emoji: '🎨', textKey: 'mobile.makeupGuide.card.photoReady.tip3' },
      { emoji: '💦', textKey: 'mobile.makeupGuide.card.photoReady.tip4' },
    ],
  },
  {
    emoji: '🤍',
    titleKey: 'mobile.makeupGuide.card.fairSkin.title',
    subtitleKey: 'mobile.makeupGuide.card.fairSkin.subtitle',
    color: '#0284c7',
    bg: '#f0f9ff',
    tips: [
      { emoji: '🌞', textKey: 'mobile.makeupGuide.card.fairSkin.tip1' },
      { emoji: '🌿', textKey: 'mobile.makeupGuide.card.fairSkin.tip2' },
      { emoji: '🎨', textKey: 'mobile.makeupGuide.card.fairSkin.tip3' },
      { emoji: '✨', textKey: 'mobile.makeupGuide.card.fairSkin.tip4' },
    ],
  },
  {
    emoji: '🧡',
    titleKey: 'mobile.makeupGuide.card.mediumSkin.title',
    subtitleKey: 'mobile.makeupGuide.card.mediumSkin.subtitle',
    color: '#d97706',
    bg: '#fffbeb',
    tips: [
      { emoji: '🌞', textKey: 'mobile.makeupGuide.card.mediumSkin.tip1' },
      { emoji: '🍊', textKey: 'mobile.makeupGuide.card.mediumSkin.tip2' },
      { emoji: '🎨', textKey: 'mobile.makeupGuide.card.mediumSkin.tip3' },
      { emoji: '✨', textKey: 'mobile.makeupGuide.card.mediumSkin.tip4' },
    ],
  },
  {
    emoji: '🖤',
    titleKey: 'mobile.makeupGuide.card.darkSkin.title',
    subtitleKey: 'mobile.makeupGuide.card.darkSkin.subtitle',
    color: '#92400e',
    bg: '#fffbeb',
    tips: [
      { emoji: '💧', textKey: 'mobile.makeupGuide.card.darkSkin.tip1' },
      { emoji: '🍊', textKey: 'mobile.makeupGuide.card.darkSkin.tip2' },
      { emoji: '🎨', textKey: 'mobile.makeupGuide.card.darkSkin.tip3' },
      { emoji: '🌞', textKey: 'mobile.makeupGuide.card.darkSkin.tip4' },
    ],
  },
  {
    emoji: '🔍',
    titleKey: 'mobile.makeupGuide.card.undertone.title',
    subtitleKey: 'mobile.makeupGuide.card.undertone.subtitle',
    color: '#7c3aed',
    bg: '#f5f3ff',
    tips: [
      { emoji: '🌞', textKey: 'mobile.makeupGuide.card.undertone.tip1' },
      { emoji: '🩷', textKey: 'mobile.makeupGuide.card.undertone.tip2' },
      { emoji: '🤝', textKey: 'mobile.makeupGuide.card.undertone.tip3' },
      { emoji: '🩶', textKey: 'mobile.makeupGuide.card.undertone.tip4' },
    ],
  },
  {
    emoji: '🎯',
    titleKey: 'mobile.makeupGuide.card.shadeMatch.title',
    subtitleKey: 'mobile.makeupGuide.card.shadeMatch.subtitle',
    color: '#e11d48',
    bg: '#fff1f2',
    tips: [
      { emoji: '🪞', textKey: 'mobile.makeupGuide.card.shadeMatch.tip1' },
      { emoji: '🌞', textKey: 'mobile.makeupGuide.card.shadeMatch.tip2' },
      { emoji: '⏰', textKey: 'mobile.makeupGuide.card.shadeMatch.tip3' },
      { emoji: '🌗', textKey: 'mobile.makeupGuide.card.shadeMatch.tip4' },
    ],
  },
  {
    emoji: '👓',
    titleKey: 'mobile.makeupGuide.card.glasses.title',
    subtitleKey: 'mobile.makeupGuide.card.glasses.subtitle',
    color: '#0284c7',
    bg: '#f0f9ff',
    tips: [
      { emoji: '👀', textKey: 'mobile.makeupGuide.card.glasses.tip1' },
      { emoji: '✨', textKey: 'mobile.makeupGuide.card.glasses.tip2' },
      { emoji: '🪶', textKey: 'mobile.makeupGuide.card.glasses.tip3' },
      { emoji: '🪒', textKey: 'mobile.makeupGuide.card.glasses.tip4' },
    ],
  },
  {
    emoji: '👁',
    titleKey: 'mobile.makeupGuide.card.lenses.title',
    subtitleKey: 'mobile.makeupGuide.card.lenses.subtitle',
    color: '#0d9488',
    bg: '#f0fdfa',
    tips: [
      { emoji: '👁', textKey: 'mobile.makeupGuide.card.lenses.tip1' },
      { emoji: '💧', textKey: 'mobile.makeupGuide.card.lenses.tip2' },
      { emoji: '🚫', textKey: 'mobile.makeupGuide.card.lenses.tip3' },
      { emoji: '🔄', textKey: 'mobile.makeupGuide.card.lenses.tip4' },
    ],
  },
];

export default function MakeupGuideScreen(): JSX.Element {
  const { t } = useLocale();
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>{t('mobile.makeupGuide.title')}</Text>
      <Text style={styles.subtitle}>{t('mobile.makeupGuide.subtitle')}</Text>
      <View style={styles.grid}>
        {CARDS.map((card, i) => (
          <View key={i} style={[styles.card, { borderColor: card.color + '30' }]}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardEmoji}>{card.emoji}</Text>
              <View style={styles.cardTitleWrap}>
                <Text style={[styles.cardTitle, { color: card.color }]}>{t(card.titleKey)}</Text>
                <Text style={styles.cardSubtitle}>{t(card.subtitleKey)}</Text>
              </View>
            </View>
            <View style={styles.tipsList}>
              {card.tips.map((tip, j) => (
                <View key={j} style={[styles.tipRow, { backgroundColor: card.bg }]}>
                  <Text style={styles.tipEmoji}>{tip.emoji}</Text>
                  <Text style={[styles.tipText, { color: card.color }]}>{t(tip.textKey)}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fdf2f8' },
  content: { padding: 16, paddingTop: 40, paddingBottom: 60 },
  header: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  grid: { gap: 12 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 4,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  cardEmoji: { fontSize: 28 },
  cardTitleWrap: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '700' },
  cardSubtitle: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
  tipsList: { gap: 6 },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  tipEmoji: { fontSize: 14, width: 20, textAlign: 'center' },
  tipText: { fontSize: 12, fontWeight: '500', flex: 1, textAlign: 'right' },
});

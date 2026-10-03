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
    emoji: '💅',
    titleKey: 'mobile.nailCareGuide.card.art.title',
    subtitleKey: 'mobile.nailCareGuide.card.art.subtitle',
    color: '#c026d3',
    bg: '#fdf4ff',
    tips: [
      { emoji: '💅', textKey: 'mobile.nailCareGuide.card.art.tip1' },
      { emoji: '✨', textKey: 'mobile.nailCareGuide.card.art.tip2' },
      { emoji: '🎨', textKey: 'mobile.nailCareGuide.card.art.tip3' },
      { emoji: '🤍', textKey: 'mobile.nailCareGuide.card.art.tip4' },
    ],
  },
  {
    emoji: '💠',
    titleKey: 'mobile.nailCareGuide.card.shapes.title',
    subtitleKey: 'mobile.nailCareGuide.card.shapes.subtitle',
    color: '#e11d48',
    bg: '#fff1f2',
    tips: [
      { emoji: '⚪', textKey: 'mobile.nailCareGuide.card.shapes.tip1' },
      { emoji: '⬜', textKey: 'mobile.nailCareGuide.card.shapes.tip2' },
      { emoji: '🥚', textKey: 'mobile.nailCareGuide.card.shapes.tip3' },
      { emoji: '🔺', textKey: 'mobile.nailCareGuide.card.shapes.tip4' },
    ],
  },
  {
    emoji: '🩺',
    titleKey: 'mobile.nailCareGuide.card.health.title',
    subtitleKey: 'mobile.nailCareGuide.card.health.subtitle',
    color: '#059669',
    bg: '#ecfdf5',
    tips: [
      { emoji: '⚪', textKey: 'mobile.nailCareGuide.card.health.tip1' },
      { emoji: '🟡', textKey: 'mobile.nailCareGuide.card.health.tip2' },
      { emoji: '〰️', textKey: 'mobile.nailCareGuide.card.health.tip3' },
      { emoji: '🩺', textKey: 'mobile.nailCareGuide.card.health.tip4' },
    ],
  },
  {
    emoji: '💅',
    titleKey: 'mobile.nailCareGuide.card.polish.title',
    subtitleKey: 'mobile.nailCareGuide.card.polish.subtitle',
    color: '#7c3aed',
    bg: '#f5f3ff',
    tips: [
      { emoji: '🧴', textKey: 'mobile.nailCareGuide.card.polish.tip1' },
      { emoji: '🎨', textKey: 'mobile.nailCareGuide.card.polish.tip2' },
      { emoji: '✨', textKey: 'mobile.nailCareGuide.card.polish.tip3' },
      { emoji: '⏳', textKey: 'mobile.nailCareGuide.card.polish.tip4' },
    ],
  },
  {
    emoji: '💎',
    titleKey: 'mobile.nailCareGuide.card.gel.title',
    subtitleKey: 'mobile.nailCareGuide.card.gel.subtitle',
    color: '#0284c7',
    bg: '#f0f9ff',
    tips: [
      { emoji: '🌞', textKey: 'mobile.nailCareGuide.card.gel.tip1' },
      { emoji: '🧤', textKey: 'mobile.nailCareGuide.card.gel.tip2' },
      { emoji: '🫒', textKey: 'mobile.nailCareGuide.card.gel.tip3' },
      { emoji: '🚫', textKey: 'mobile.nailCareGuide.card.gel.tip4' },
    ],
  },
  {
    emoji: '🤲',
    titleKey: 'mobile.nailCareGuide.card.paraffin.title',
    subtitleKey: 'mobile.nailCareGuide.card.paraffin.subtitle',
    color: '#d97706',
    bg: '#fffbeb',
    tips: [
      { emoji: '🕯️', textKey: 'mobile.nailCareGuide.card.paraffin.tip1' },
      { emoji: '💧', textKey: 'mobile.nailCareGuide.card.paraffin.tip2' },
      { emoji: '⏰', textKey: 'mobile.nailCareGuide.card.paraffin.tip3' },
      { emoji: '🧴', textKey: 'mobile.nailCareGuide.card.paraffin.tip4' },
    ],
  },
  {
    emoji: '🧤',
    titleKey: 'mobile.nailCareGuide.card.handMask.title',
    subtitleKey: 'mobile.nailCareGuide.card.handMask.subtitle',
    color: '#e11d48',
    bg: '#fff1f2',
    tips: [
      { emoji: '🧴', textKey: 'mobile.nailCareGuide.card.handMask.tip1' },
      { emoji: '🧤', textKey: 'mobile.nailCareGuide.card.handMask.tip2' },
      { emoji: '✨', textKey: 'mobile.nailCareGuide.card.handMask.tip3' },
      { emoji: '📅', textKey: 'mobile.personalCare.card.lymphaticDrainage.tip4' },
    ],
  },
  {
    emoji: '🛁',
    titleKey: 'mobile.nailCareGuide.card.footSoak.title',
    subtitleKey: 'mobile.nailCareGuide.card.footSoak.subtitle',
    color: '#0d9488',
    bg: '#f0fdfa',
    tips: [
      { emoji: '🧂', textKey: 'mobile.nailCareGuide.card.footSoak.tip1' },
      { emoji: '🌸', textKey: 'mobile.nailCareGuide.card.footSoak.tip2' },
      { emoji: '🍋', textKey: 'mobile.nailCareGuide.card.footSoak.tip3' },
      { emoji: '🍯', textKey: 'mobile.nailCareGuide.card.footSoak.tip4' },
    ],
  },
  {
    emoji: '💪',
    titleKey: 'mobile.nailCareGuide.card.strengthening.title',
    subtitleKey: 'mobile.nailCareGuide.card.strengthening.subtitle',
    color: '#7c3aed',
    bg: '#f5f3ff',
    tips: [
      { emoji: '💪', textKey: 'mobile.nailCareGuide.card.strengthening.tip1' },
      { emoji: '🫒', textKey: 'mobile.nailCareGuide.card.strengthening.tip2' },
      { emoji: '💊', textKey: 'mobile.nailCareGuide.card.strengthening.tip3' },
      { emoji: '🧤', textKey: 'mobile.nailCareGuide.card.strengthening.tip4' },
    ],
  },
  {
    emoji: '🦶',
    titleKey: 'mobile.nailCareGuide.card.callusCare.title',
    subtitleKey: 'mobile.nailCareGuide.card.callusCare.subtitle',
    color: '#ea580c',
    bg: '#fff7ed',
    tips: [
      { emoji: '🪨', textKey: 'mobile.nailCareGuide.card.callusCare.tip1' },
      { emoji: '🧴', textKey: 'mobile.nailCareGuide.card.callusCare.tip2' },
      { emoji: '🧦', textKey: 'mobile.nailCareGuide.card.callusCare.tip3' },
      { emoji: '📅', textKey: 'mobile.nailCareGuide.card.callusCare.tip4' },
    ],
  },
];

export default function NailCareGuideScreen(): JSX.Element {
  const { t } = useLocale();
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>{t('mobile.nailCareGuide.title')}</Text>
      <Text style={styles.subtitle}>{t('mobile.nailCareGuide.subtitle')}</Text>
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
  container: { flex: 1, backgroundColor: '#fdf4ff' },
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

import type { JSX } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import type { TranslationKey } from '@galaxy/shared';
import { useLocale } from '@/components/LocaleProvider';

interface Tip {
  emoji: string;
  textKey: TranslationKey;
}
interface AccCard {
  emoji: string;
  titleKey: TranslationKey;
  subtitleKey: TranslationKey;
  color: string;
  bg: string;
  tips: Tip[];
}

const CARDS: AccCard[] = [
  {
    emoji: '💍',
    titleKey: 'mobile.accessoriesGuide.card.styling.title',
    subtitleKey: 'mobile.accessoriesGuide.card.styling.subtitle',
    color: '#d97706',
    bg: '#fffbeb',
    tips: [
      { emoji: '💎', textKey: 'mobile.accessoriesGuide.card.styling.tip1' },
      { emoji: '📿', textKey: 'mobile.accessoriesGuide.card.styling.tip2' },
      { emoji: '⌚', textKey: 'mobile.accessoriesGuide.card.styling.tip3' },
      { emoji: '💍', textKey: 'mobile.accessoriesGuide.card.styling.tip4' },
    ],
  },
  {
    emoji: '👜',
    titleKey: 'mobile.accessoriesGuide.card.beautyBag.title',
    subtitleKey: 'mobile.accessoriesGuide.card.beautyBag.subtitle',
    color: '#4f46e5',
    bg: '#eef2ff',
    tips: [
      { emoji: '💄', textKey: 'mobile.accessoriesGuide.card.beautyBag.tip1' },
      { emoji: '🪞', textKey: 'mobile.accessoriesGuide.card.beautyBag.tip2' },
      { emoji: '🧴', textKey: 'mobile.accessoriesGuide.card.beautyBag.tip3' },
      { emoji: '☀️', textKey: 'mobile.accessoriesGuide.card.beautyBag.tip4' },
    ],
  },
  {
    emoji: '🧕',
    titleKey: 'mobile.accessoriesGuide.card.hijabElegance.title',
    subtitleKey: 'mobile.accessoriesGuide.card.hijabElegance.subtitle',
    color: '#059669',
    bg: '#ecfdf5',
    tips: [
      { emoji: '🎨', textKey: 'mobile.accessoriesGuide.card.hijabElegance.tip1' },
      { emoji: '📌', textKey: 'mobile.accessoriesGuide.card.hijabElegance.tip2' },
      { emoji: '🧣', textKey: 'mobile.accessoriesGuide.card.hijabElegance.tip3' },
      { emoji: '✨', textKey: 'mobile.accessoriesGuide.card.hijabElegance.tip4' },
    ],
  },
];

export default function AccessoriesGuideScreen(): JSX.Element {
  const { t } = useLocale();
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>{t('accessoriesGuide.title')}</Text>
      <Text style={styles.subtitle}>{t('accessoriesGuide.subtitle')}</Text>
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

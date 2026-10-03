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
    emoji: '🌞',
    titleKey: 'mobile.beautyServices.sunAdvice.title',
    subtitleKey: 'mobile.beautyServices.sunAdvice.subtitle',
    color: '#d97706',
    bg: '#fffbeb',
    tips: [
      { emoji: '🧴', textKey: 'mobile.beautyServices.sunAdvice.tip1' },
      { emoji: '🔄', textKey: 'mobile.beautyServices.sunAdvice.tip2' },
      { emoji: '🏠', textKey: 'mobile.beautyServices.sunAdvice.tip3' },
      { emoji: '📅', textKey: 'mobile.beautyServices.sunAdvice.tip4' },
    ],
  },
  {
    emoji: '🚨',
    titleKey: 'mobile.beautyServices.emergency.title',
    subtitleKey: 'mobile.beautyServices.emergency.subtitle',
    color: '#e11d48',
    bg: '#fff1f2',
    tips: [
      { emoji: '📞', textKey: 'mobile.beautyServices.emergency.tip1' },
      { emoji: '⏰', textKey: 'mobile.beautyServices.emergency.tip2' },
      { emoji: '🏡', textKey: 'mobile.beautyServices.emergency.tip3' },
      { emoji: '🩺', textKey: 'mobile.beautyServices.emergency.tip4' },
    ],
  },
  {
    emoji: '🏢',
    titleKey: 'mobile.beautyServices.facilities.title',
    subtitleKey: 'mobile.beautyServices.facilities.subtitle',
    color: '#0d9488',
    bg: '#f0fdfa',
    tips: [
      { emoji: '📶', textKey: 'mobile.beautyServices.facilities.tip1' },
      { emoji: '🅿️', textKey: 'mobile.beautyServices.facilities.tip2' },
      { emoji: '☕', textKey: 'mobile.beautyServices.facilities.tip3' },
      { emoji: '🧸', textKey: 'mobile.beautyServices.facilities.tip4' },
    ],
  },
  {
    emoji: '🕌',
    titleKey: 'mobile.beautyServices.prayerRoom.title',
    subtitleKey: 'mobile.beautyServices.prayerRoom.subtitle',
    color: '#059669',
    bg: '#ecfdf5',
    tips: [
      { emoji: '🧎', textKey: 'mobile.beautyServices.prayerRoom.tip1' },
      { emoji: '🧥', textKey: 'mobile.beautyServices.prayerRoom.tip2' },
      { emoji: '🧭', textKey: 'mobile.beautyServices.prayerRoom.tip3' },
      { emoji: '🚿', textKey: 'mobile.beautyServices.prayerRoom.tip4' },
    ],
  },
  {
    emoji: '📊',
    titleKey: 'marketing.product-compare.title',
    subtitleKey: 'mobile.beautyServices.productCompare.subtitle',
    color: '#0284c7',
    bg: '#f0f9ff',
    tips: [
      { emoji: '🧴', textKey: 'mobile.beautyServices.productCompare.tip1' },
      { emoji: '💧', textKey: 'mobile.beautyServices.productCompare.tip2' },
      { emoji: '🥇', textKey: 'mobile.beautyServices.productCompare.tip3' },
      { emoji: '🥈', textKey: 'mobile.beautyServices.productCompare.tip4' },
    ],
  },
  {
    emoji: '💎',
    titleKey: 'mobile.beautyLifestyle.card.premiumSubscription.title',
    subtitleKey: 'mobile.beautyServices.premium.subtitle',
    color: '#7c3aed',
    bg: '#f5f3ff',
    tips: [
      { emoji: '💰', textKey: 'mobile.beautyLifestyle.card.premiumSubscription.tip1' },
      { emoji: '📅', textKey: 'mobile.beautyLifestyle.card.premiumSubscription.tip2' },
      { emoji: '🎁', textKey: 'mobile.beautyLifestyle.card.premiumSubscription.tip3' },
      { emoji: '⭐', textKey: 'mobile.beautyLifestyle.card.premiumSubscription.tip4' },
    ],
  },
];

export default function BeautyServicesScreen(): JSX.Element {
  const { t } = useLocale();
  return (
    <ScrollView style={s.c} contentContainerStyle={s.i}>
      <Text style={s.h}>{t('beautyServices.title')}</Text>
      <Text style={s.sub}>{t('beautyServices.subtitle')}</Text>
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
  c: { flex: 1, backgroundColor: '#f0fdfa' },
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

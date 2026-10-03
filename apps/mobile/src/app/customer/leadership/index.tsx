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
    emoji: '👑',
    titleKey: 'mobile.leadership.card.sheLeads.title',
    subtitleKey: 'mobile.leadership.card.sheLeads.subtitle',
    color: '#7c3aed',
    bg: '#f5f3ff',
    tips: [
      { emoji: '🎓', textKey: 'mobile.leadership.card.sheLeads.tip1' },
      { emoji: '💰', textKey: 'mobile.leadership.card.sheLeads.tip2' },
      { emoji: '🤝', textKey: 'mobile.leadership.card.sheLeads.tip3' },
      { emoji: '📜', textKey: 'mobile.leadership.card.sheLeads.tip4' },
    ],
  },
  {
    emoji: '💼',
    titleKey: 'mobile.leadership.card.entrepreneur.title',
    subtitleKey: 'mobile.leadership.card.entrepreneur.subtitle',
    color: '#d97706',
    bg: '#fffbeb',
    tips: [
      { emoji: '📝', textKey: 'mobile.leadership.card.entrepreneur.tip1' },
      { emoji: '💰', textKey: 'mobile.leadership.card.entrepreneur.tip2' },
      { emoji: '🏪', textKey: 'mobile.leadership.card.entrepreneur.tip3' },
      { emoji: '🧭', textKey: 'mobile.leadership.card.entrepreneur.tip4' },
    ],
  },
  {
    emoji: '🏆',
    titleKey: 'mobile.leadership.card.successStories.title',
    subtitleKey: 'mobile.leadership.card.successStories.subtitle',
    color: '#db2777',
    bg: '#fdf2f8',
    tips: [
      { emoji: '💇', textKey: 'mobile.leadership.card.successStories.tip1' },
      { emoji: '🏪', textKey: 'mobile.leadership.card.successStories.tip2' },
      { emoji: '🚀', textKey: 'mobile.leadership.card.successStories.tip3' },
      { emoji: '✨', textKey: 'mobile.leadership.card.successStories.tip4' },
    ],
  },
  {
    emoji: '🎯',
    titleKey: 'mobile.leadership.card.leadershipGoals.title',
    subtitleKey: 'mobile.leadership.card.leadershipGoals.subtitle',
    color: '#059669',
    bg: '#ecfdf5',
    tips: [
      { emoji: '🌱', textKey: 'mobile.leadership.card.leadershipGoals.tip1' },
      { emoji: '🌿', textKey: 'mobile.leadership.card.leadershipGoals.tip2' },
      { emoji: '🌳', textKey: 'mobile.leadership.card.leadershipGoals.tip3' },
      { emoji: '🌍', textKey: 'mobile.leadership.card.leadershipGoals.tip4' },
    ],
  },
];

export default function LeadershipScreen(): JSX.Element {
  const { t } = useLocale();
  return (
    <ScrollView style={s.c} contentContainerStyle={s.i}>
      <Text style={s.h}>{t('mobile.leadership.title')}</Text>
      <Text style={s.sub}>{t('mobile.leadership.subtitle')}</Text>
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

const sc = StyleSheet.create({
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
const s = sc;

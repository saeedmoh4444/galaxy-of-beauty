import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import type { JSX } from 'react';
import type { TranslationKey } from '@galaxy/shared';
import { useLocale } from '@/components/LocaleProvider';

interface Season {
  id: string;
  nameKey: TranslationKey;
  emoji: string;
  color: string;
}

const SEASONS: Season[] = [
  {
    id: 'summer',
    nameKey: 'mobile.public.lookbook.season.summer',
    emoji: '☀️',
    color: '#f59e0b',
  },
  { id: 'eid', nameKey: 'mobile.public.lookbook.season.eid', emoji: '✨', color: '#10b981' },
  {
    id: 'wedding',
    nameKey: 'mobile.public.lookbook.season.wedding',
    emoji: '💍',
    color: '#ec4899',
  },
  {
    id: 'ramadan',
    nameKey: 'mobile.public.lookbook.season.ramadan',
    emoji: '🌙',
    color: '#7c3aed',
  },
];

interface Look {
  titleKey: TranslationKey;
  descKey: TranslationKey;
  emoji: string;
  tagKeys: TranslationKey[];
}

const LOOKS: Record<string, Look[]> = {
  summer: [
    {
      titleKey: 'mobile.public.lookbook.summer.look1.title',
      descKey: 'mobile.public.lookbook.summer.look1.desc',
      emoji: '🏖️',
      tagKeys: [
        'mobile.public.lookbook.tag.makeup',
        'mobile.public.lookbook.tag.hair',
        'mobile.public.lookbook.tag.care',
      ],
    },
    {
      titleKey: 'mobile.public.lookbook.summer.look2.title',
      descKey: 'mobile.public.lookbook.summer.look2.desc',
      emoji: '🧴',
      tagKeys: ['mobile.public.lookbook.tag.skin', 'mobile.public.lookbook.tag.care'],
    },
    {
      titleKey: 'mobile.public.lookbook.summer.look3.title',
      descKey: 'mobile.public.lookbook.summer.look3.desc',
      emoji: '💅',
      tagKeys: ['mobile.public.lookbook.tag.nails', 'mobile.public.lookbook.tag.manicure'],
    },
  ],
  eid: [
    {
      titleKey: 'mobile.public.lookbook.eid.look1.title',
      descKey: 'mobile.public.lookbook.eid.look1.desc',
      emoji: '💫',
      tagKeys: ['mobile.public.lookbook.tag.makeup', 'mobile.public.lookbook.tag.hair'],
    },
    {
      titleKey: 'mobile.public.lookbook.eid.look2.title',
      descKey: 'mobile.public.lookbook.eid.look2.desc',
      emoji: '🌿',
      tagKeys: ['mobile.public.lookbook.tag.henna', 'mobile.public.lookbook.tag.occasions'],
    },
    {
      titleKey: 'mobile.public.lookbook.eid.look3.title',
      descKey: 'mobile.public.lookbook.eid.look3.desc',
      emoji: '✨',
      tagKeys: ['mobile.public.lookbook.tag.skin', 'mobile.public.lookbook.tag.care'],
    },
  ],
  wedding: [
    {
      titleKey: 'mobile.public.lookbook.wedding.look1.title',
      descKey: 'mobile.public.lookbook.wedding.look1.desc',
      emoji: '👰',
      tagKeys: [
        'mobile.public.lookbook.tag.brides',
        'mobile.public.lookbook.tag.makeup',
        'mobile.public.lookbook.tag.hair',
      ],
    },
    {
      titleKey: 'mobile.public.lookbook.wedding.look2.title',
      descKey: 'mobile.public.lookbook.wedding.look2.desc',
      emoji: '📸',
      tagKeys: ['mobile.public.lookbook.tag.makeup', 'mobile.public.lookbook.tag.photography'],
    },
    {
      titleKey: 'mobile.public.lookbook.wedding.look3.title',
      descKey: 'mobile.public.lookbook.wedding.look3.desc',
      emoji: '💐',
      tagKeys: ['mobile.public.lookbook.tag.makeup', 'mobile.public.lookbook.tag.occasions'],
    },
  ],
  ramadan: [
    {
      titleKey: 'mobile.public.lookbook.ramadan.look1.title',
      descKey: 'mobile.public.lookbook.ramadan.look1.desc',
      emoji: '🌙',
      tagKeys: ['mobile.public.lookbook.tag.makeup', 'mobile.public.lookbook.tag.evening'],
    },
    {
      titleKey: 'mobile.public.lookbook.ramadan.look2.title',
      descKey: 'mobile.public.lookbook.ramadan.look2.desc',
      emoji: '🧴',
      tagKeys: ['mobile.public.lookbook.tag.skin', 'mobile.public.lookbook.tag.care'],
    },
    {
      titleKey: 'mobile.public.lookbook.ramadan.look3.title',
      descKey: 'mobile.public.lookbook.ramadan.look3.desc',
      emoji: '💇',
      tagKeys: ['mobile.public.lookbook.tag.hair', 'mobile.public.lookbook.tag.hairstyle'],
    },
  ],
};

export default function LookbookScreen(): JSX.Element {
  const { t } = useLocale();
  const [season, setSeason] = useState('summer');
  const currentLooks = LOOKS[season] ?? [];

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>{t('mobile.public.lookbook.title')}</Text>
      <Text style={styles.sub}>{t('mobile.public.lookbook.subtitle')}</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {SEASONS.map((s) => (
            <TouchableOpacity
              key={s.id}
              onPress={() => setSeason(s.id)}
              style={[styles.seasonChip, season === s.id && { backgroundColor: s.color }]}
            >
              <Text style={[styles.seasonText, season === s.id && { color: '#fff' }]}>
                {s.emoji} {t(s.nameKey)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {currentLooks.map((look, i) => (
        <View key={i} style={styles.card}>
          <Text style={styles.lookEmoji}>{look.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.lookTitle}>{t(look.titleKey)}</Text>
            <Text style={styles.lookDesc}>{t(look.descKey)}</Text>
            <View style={styles.tags}>
              {look.tagKeys.map((tagKey) => (
                <Text key={tagKey} style={styles.tag}>
                  {t(tagKey)}
                </Text>
              ))}
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#db2777', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 16 },
  seasonChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  seasonText: { fontSize: 13, fontWeight: '700', color: '#6b7280' },
  card: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  lookEmoji: { fontSize: 36 },
  lookTitle: { fontSize: 15, fontWeight: '700', color: '#111827' },
  lookDesc: { fontSize: 13, color: '#6b7280', marginTop: 4, lineHeight: 20 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  tag: {
    fontSize: 11,
    color: '#db2777',
    backgroundColor: '#fdf2f8',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
});

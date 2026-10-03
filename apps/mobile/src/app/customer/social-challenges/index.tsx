import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import type { JSX } from 'react';
import type { TranslationKey } from '@galaxy/shared';
import { useLocale } from '@/components/LocaleProvider';

interface Challenge {
  key: string;
  emoji: string;
  nameKey: TranslationKey;
  descKey: TranslationKey;
  participants: number;
  durationKey: TranslationKey;
  prizeKey: TranslationKey;
}

const CHALLENGES: Challenge[] = [
  {
    key: '7day_mask',
    emoji: '🧖',
    nameKey: 'socialChallenge.chal.mask',
    descKey: 'socialChallenge.desc.mask',
    participants: 234,
    durationKey: 'socialChallenge.duration.mask',
    prizeKey: 'socialChallenge.prize.mask',
  },
  {
    key: 'selfie_30',
    emoji: '🤳',
    nameKey: 'socialChallenge.chal.noMakeup',
    descKey: 'socialChallenge.desc.noMakeup',
    participants: 156,
    durationKey: 'socialChallenge.duration.noMakeup',
    prizeKey: 'socialChallenge.prize.noMakeup',
  },
  {
    key: 'water_challenge',
    emoji: '💧',
    nameKey: 'socialChallenge.chal.water',
    descKey: 'socialChallenge.desc.water',
    participants: 412,
    durationKey: 'socialChallenge.duration.water',
    prizeKey: 'socialChallenge.prize.water',
  },
  {
    key: 'night_routine',
    emoji: '🌙',
    nameKey: 'socialChallenge.chal.nightRoutine',
    descKey: 'socialChallenge.desc.nightRoutine',
    participants: 189,
    durationKey: 'socialChallenge.duration.nightRoutine',
    prizeKey: 'socialChallenge.prize.nightRoutine',
  },
  {
    key: 'natural_hair',
    emoji: '💇',
    nameKey: 'socialChallenge.chal.naturalHair',
    descKey: 'socialChallenge.desc.naturalHair',
    participants: 98,
    durationKey: 'socialChallenge.duration.water',
    prizeKey: 'socialChallenge.prize.naturalHair',
  },
];

export default function SocialChallengesScreen(): JSX.Element {
  const { t } = useLocale();
  const [joined, setJoined] = useState<string[]>([]);

  const toggle = (key: string) => {
    if (joined.includes(key)) setJoined(joined.filter((x) => x !== key));
    else setJoined([...joined, key]);
  };

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>{t('mobile.socialChallenges.title')}</Text>
      <Text style={styles.sub}>{t('mobile.socialChallenges.subtitle')}</Text>

      <View style={styles.myChallenges}>
        <Text style={styles.mct}>
          {t('mobile.socialChallenges.my-challenges', { count: joined.length })}
        </Text>
        {joined.length === 0 ? (
          <Text style={styles.mce}>{t('mobile.socialChallenges.no-challenges')}</Text>
        ) : (
          joined.map((key) => {
            const c = CHALLENGES.find((x) => x.key === key)!;
            return (
              <View key={key} style={styles.mc}>
                <Text style={styles.mce}>{c.emoji}</Text>
                <Text style={styles.mcn}>{t(c.nameKey)}</Text>
              </View>
            );
          })
        )}
      </View>

      {CHALLENGES.map((c) => {
        const isJoined = joined.includes(c.key);
        return (
          <View key={c.key} style={[styles.card, isJoined && styles.cardJoined]}>
            <View style={styles.ch}>
              <Text style={styles.che}>{c.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.chn}>{t(c.nameKey)}</Text>
                <Text style={styles.chd}>{t(c.descKey)}</Text>
              </View>
            </View>
            <View style={styles.cm}>
              <Text style={styles.cmi}>
                {c.participants} · {t(c.durationKey)}
              </Text>
              <Text style={styles.cmi}> {t(c.prizeKey)}</Text>
            </View>
            <View style={styles.cb}>
              <View
                style={[styles.bar, { width: `${Math.min(100, (c.participants / 500) * 100)}%` }]}
              />
            </View>
            <TouchableOpacity
              onPress={() => toggle(c.key)}
              style={[styles.jb, isJoined && styles.jbJoined]}
            >
              <Text style={[styles.jt, isJoined && styles.jtJoined]}>
                {isJoined ? t('mobile.socialChallenges.joined') : t('mobile.socialChallenges.join')}
              </Text>
            </TouchableOpacity>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fffbeb' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#d97706', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  myChallenges: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 20 },
  mct: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 8 },
  mce: { fontSize: 14, color: '#9ca3af' },
  mc: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 },
  mcn: { fontSize: 13, color: '#374151' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12 },
  cardJoined: { borderWidth: 2, borderColor: '#fcd34d' },
  ch: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  che: { fontSize: 36 },
  chn: { fontSize: 15, fontWeight: '700', color: '#111827' },
  chd: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  cm: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  cmi: { fontSize: 11, color: '#6b7280' },
  cb: { height: 4, backgroundColor: '#f3f4f6', borderRadius: 2, marginTop: 8 },
  bar: { height: 4, backgroundColor: '#d97706', borderRadius: 2 },
  jb: {
    backgroundColor: '#d97706',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  jbJoined: { backgroundColor: '#dcfce7' },
  jt: { color: '#fff', fontSize: 13, fontWeight: '600' },
  jtJoined: { color: '#059669' },
});

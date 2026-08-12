import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useState } from 'react';

const CHALLENGES = [
  {
    key: '7day_mask',
    emoji: '',
    name: 'تحدي ٧ أيام قناع',
    desc: 'قناع يومي للبشرة لمدة أسبوع',
    participants: 234,
    duration: '7 أيام',
    prize: 'قناع مجاني',
  },
  {
    key: 'selfie_30',
    emoji: '',
    name: 'تحدي ٣٠ يوم بدون مكياج',
    desc: 'صوري بشرتكِ يومياً بدون مكياج',
    participants: 156,
    duration: '30 يوم',
    prize: 'جلسة عناية مجانية',
  },
  {
    key: 'water_challenge',
    emoji: '',
    name: 'تحدي ٨ أكواب ماء',
    desc: 'اشربي ٨ أكواب ماء يومياً',
    participants: 412,
    duration: '14 يوم',
    prize: 'منتجات ترطيب',
  },
  {
    key: 'night_routine',
    emoji: '',
    name: 'تحدي الروتين الليلي',
    desc: 'التزمي بروتينكِ الليلي لمدة ٢١ يوم',
    participants: 189,
    duration: '21 يوم',
    prize: 'باقة عناية ليلية',
  },
  {
    key: 'natural_hair',
    emoji: '‍️',
    name: 'تحدي شعر طبيعي',
    desc: 'تجنبي الحرارة لمدة أسبوعين',
    participants: 98,
    duration: '14 يوم',
    prize: 'علاج شعر طبيعي',
  },
];

export default function SocialChallengesScreen(): JSX.Element {
  const [joined, setJoined] = useState<string[]>([]);

  const toggle = (key: string) => {
    if (joined.includes(key)) setJoined(joined.filter((x) => x !== key));
    else setJoined([...joined, key]);
  };

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}> تحديات اجتماعية</Text>
      <Text style={styles.sub}>انضمي للتحديات الجماعية وكسبي مكافآت</Text>

      <View style={styles.myChallenges}>
        <Text style={styles.mct}> تحدياتي ({joined.length})</Text>
        {joined.length === 0 ? (
          <Text style={styles.mce}>لم تنضمي لأي تحدي بعد</Text>
        ) : (
          joined.map((key) => {
            const c = CHALLENGES.find((x) => x.key === key)!;
            return (
              <View key={key} style={styles.mc}>
                <Text style={styles.mce}>{c.emoji}</Text>
                <Text style={styles.mcn}>{c.name}</Text>
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
                <Text style={styles.chn}>{c.name}</Text>
                <Text style={styles.chd}>{c.desc}</Text>
              </View>
            </View>
            <View style={styles.cm}>
              <Text style={styles.cmi}>
                 {c.participants} · ️ {c.duration}
              </Text>
              <Text style={styles.cmi}> {c.prize}</Text>
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
                {isJoined ? ' منضم' : 'انضمام'}
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

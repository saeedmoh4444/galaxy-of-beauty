import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function PenPalScreen() {
  const [matches, setMatches] = useState<Record<string, unknown>[]>([]);
  const [interests, setInterests] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    Promise.all([(trpc.penPal.match.query() as any), (trpc.penPal.interests.query() as any)])
      .then(([m, i]) => { setMatches(m || []); setInterests(i || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator color="#ec4899" style={{ marginTop: 40 }} size="large" />;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>💌 Beauty Pen Pal</Text>
      {matches.length === 0 ? <Text style={styles.e}>لا توجد تطابقات</Text> : matches.map((m: Record<string, unknown>, i: number) => (
        <View key={i} style={styles.card}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{(m.userName as string)?.[0] || '👤'}</Text></View>
          <View style={{flex:1}}><Text style={styles.name}>{m.userName as string}</Text><Text style={styles.score}>{m.score as number} اهتمامات مشتركة</Text></View>
          <View style={styles.intIcons}>{(m.interests as string[])?.map((s: string) => <Text key={s}>{(interests as any[]).find((x: any) => x.key === s)?.emoji || '💬'}</Text>)}</View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#be185d', textAlign: 'center', marginBottom: 20 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  card: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 8, alignItems: 'center', gap: 10 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fce7f3', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 18, fontWeight: '700', color: '#be185d' },
  name: { fontSize: 14, fontWeight: '700', color: '#111827', textAlign: 'right' },
  score: { fontSize: 12, color: '#059669', textAlign: 'right', marginTop: 2 },
  intIcons: { flexDirection: 'row', gap: 2 },
});

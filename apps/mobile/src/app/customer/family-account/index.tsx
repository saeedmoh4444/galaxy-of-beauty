import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

const REL_EMOJI: any = { child: '👶', spouse: '💑', parent: '👵', sibling: '👫', other: '👤' };
const AGE_EMOJI: any = { infant: '🍼', child: '🧒', teen: '👧', adult: '👩', senior: '👵' };

export default function FamilyAccountScreen() {
  const [members, setMembers] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { (trpc.familyAccount.list.query() as any).then((d: any) => { setMembers(d || []); setLoading(false); }).catch(() => setLoading(false)); }, []);

  if (loading) return <ActivityIndicator color="#7c3aed" style={{ marginTop: 40 }} size="large" />;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>👨‍👩‍👧 حساب العائلة</Text>
      {members.length === 0 ? <Text style={styles.e}>لا يوجد أفراد</Text> : members.map((m: Record<string, unknown>, i: number) => (
        <View key={i} style={styles.card}>
          <Text style={styles.cardEmoji}>{AGE_EMOJI[m.ageGroup as string] || '👩'}</Text>
          <View style={{flex:1}}><Text style={styles.name}>{m.name as string}</Text><Text style={styles.rel}>{REL_EMOJI[m.relationship as string] || '👤'} {m.relationship as string}</Text></View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#faf5ff' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#7c3aed', textAlign: 'center', marginBottom: 20 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  card: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 8, alignItems: 'center', gap: 12 },
  cardEmoji: { fontSize: 36 }, name: { fontSize: 15, fontWeight: '700', color: '#111827', textAlign: 'right' },
  rel: { fontSize: 12, color: '#6b7280', textAlign: 'right', marginTop: 4 },
});

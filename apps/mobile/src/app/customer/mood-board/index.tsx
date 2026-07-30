import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function MoodBoardScreen() {
  const [boards, setBoards] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { (trpc.moodBoard.list.query() as any).then((d: any) => { setBoards(d || []); setLoading(false); }).catch(() => setLoading(false)); }, []);

  if (loading) return <ActivityIndicator color="#8b5cf6" style={{ marginTop: 40 }} size="large" />;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>🎨 لوحة الإلهام</Text>
      {boards.length === 0 ? <Text style={styles.e}>لا توجد لوحات</Text> :
        boards.map((b: Record<string, unknown>, i: number) => (
          <View key={i} style={styles.card}>
            <View style={styles.cover}><Text style={styles.coverEmoji}>🎨</Text></View>
            <Text style={styles.name}>{b.name as string}</Text>
            {(b.description as string) ? <Text style={styles.desc}>{b.description as string}</Text> : null}
            <Text style={styles.count}>{(b.pins as any[])?.length || 0} صورة</Text>
          </View>
        ))
      }
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#faf5ff' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#7c3aed', textAlign: 'center', marginBottom: 20 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10 },
  cover: { height: 120, borderRadius: 10, backgroundColor: '#ede9fe', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  coverEmoji: { fontSize: 40 },
  name: { fontSize: 16, fontWeight: '700', color: '#111827', textAlign: 'right' },
  desc: { fontSize: 12, color: '#6b7280', textAlign: 'right', marginTop: 4 },
  count: { fontSize: 12, fontWeight: '600', color: '#7c3aed', textAlign: 'right', marginTop: 8 },
});

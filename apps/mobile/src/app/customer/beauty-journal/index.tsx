import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function BeautyJournalScreen() {
  const [entries, setEntries] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { ((trpc as any).beautyJournal.list.query({ page: 1, limit: 20 }) as any).then((d: any) => { setEntries(d || []); setLoading(false); }).catch(() => setLoading(false)); }, []);

  if (loading) return <ActivityIndicator color="#8b5cf6" style={{ marginTop: 40 }} size="large" />;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>📔 يوميات الجمال</Text>
      {entries.length === 0 ? <Text style={styles.e}>لا توجد إدخالات</Text> :
        entries.map((e: Record<string, unknown>, i: number) => (
          <View key={i} style={styles.card}>
            <Text style={styles.date}>{new Date(e.createdAt as string).toLocaleDateString('ar-SA')}</Text>
            {(e.title as string) ? <Text style={styles.entryTitle}>{e.title as string}</Text> : null}
            <Text style={styles.content}>{e.content as string}</Text>
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
  date: { fontSize: 12, color: '#9ca3af', textAlign: 'right', marginBottom: 4 },
  entryTitle: { fontSize: 15, fontWeight: '700', color: '#111827', textAlign: 'right', marginBottom: 4 },
  content: { fontSize: 13, color: '#374151', textAlign: 'right', lineHeight: 22 },
});

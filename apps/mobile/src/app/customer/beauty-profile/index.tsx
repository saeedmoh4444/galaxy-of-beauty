import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function BeautyProfileScreen() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { ((trpc as any).beautyProfile.get.query() as any).then((d: any) => { setData(d); setLoading(false); }).catch(() => setLoading(false)); }, []);

  if (loading) return <ActivityIndicator color="#ec4899" style={{ marginTop: 40 }} size="large" />;
  if (!data) return <Text style={styles.e}>لا يوجد ملف</Text>;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>💄 ملف الجمال</Text>
      <View style={styles.card}>
        {['skinType','hairType','hairLength','skinTone','makeupStyle'].map((k: string) => (
          <View key={k} style={styles.row}><Text style={styles.label}>{k}</Text><Text style={styles.val}>{(data[k] as string) || '—'}</Text></View>
        ))}
        {data.concerns && <View style={styles.concerns}>{(data.concerns as string[]).map((c: string) => <Text key={c} style={styles.concern}>{c}</Text>)}</View>}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#be185d', textAlign: 'center', marginBottom: 20 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  label: { fontSize: 13, color: '#6b7280' }, val: { fontSize: 13, fontWeight: '600', color: '#111827', textAlign: 'right' },
  concerns: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 12, justifyContent: 'flex-end' },
  concern: { fontSize: 11, backgroundColor: '#fce7f3', color: '#be185d', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
});
